import { Hono } from "npm:hono@4.11.7";
import { cors } from "npm:hono@4.11.7/cors";
import { logger } from "npm:hono@4.11.7/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// CRITICAL: CORS MUST be the FIRST middleware
// Enhanced CORS configuration
const corsOptions = {
  origin: "*", // Allow all origins
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
  exposeHeaders: ["Content-Length", "Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
  credentials: false,
};

// Enable CORS for all routes - FIRST middleware
app.use("/*", cors(corsOptions));

// Handle OPTIONS requests explicitly (preflight)
app.options("*", (c) => {
  return c.text("", 204);
});

// Add CORS headers manually to all responses as backup
app.use("*", async (c, next) => {
  await next();
  // Ensure CORS headers are always present
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  c.header("Access-Control-Max-Age", "86400");
});

// Enable logger (after CORS)
app.use('*', logger(console.log));

// Create Supabase admin client for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify auth token and get user ID
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  // Skip verification if using anon key
  if (token === Deno.env.get('SUPABASE_ANON_KEY')) {
    return null;
  }
  
  try {
    // Create a client with the user's token to verify it
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    const { data: { user }, error } = await userSupabase.auth.getUser();
    if (error || !user) {
      console.log('Auth error while verifying user token:', error?.message);
      return null;
    }
    return user;
  } catch (err) {
    console.log('Unexpected error while verifying user token:', err);
    return null;
  }
}

// Health check endpoint
app.get("/make-server-e298da7a/health", (c) => {
  return c.json({ status: "ok" });
});

// Open Food Facts proxy (User-Agent requis par l'API, impossible côté client)
app.get("/make-server-e298da7a/product/barcode/:barcode", async (c) => {
  const barcode = c.req.param("barcode");
  if (!barcode || !/^\d+$/.test(barcode)) {
    return c.json({ error: "Code-barres invalide" }, 400);
  }
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: { "User-Agent": "KitchIn-App/1.0 (https://kitchin.app)" },
    });
    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return c.json({ product: null });
    }
    const product = data.product;
    const categories = product.categories_tags || [];
    const categoryText = categories.join(" ").toLowerCase();
    let productCategory: "fridge" | "pantry" | "freezer" = "pantry";
    if (categoryText.includes("dairy") || categoryText.includes("lait") || categoryText.includes("yaourt") ||
        categoryText.includes("viande") || categoryText.includes("meat") || categoryText.includes("poisson") ||
        categoryText.includes("légume") || categoryText.includes("vegetable") || categoryText.includes("fruit")) {
      productCategory = "fridge";
    } else if (categoryText.includes("surgelé") || categoryText.includes("frozen") ||
               categoryText.includes("glace") || categoryText.includes("ice-cream")) {
      productCategory = "freezer";
    }
    return c.json({
      product: {
        name: product.product_name || product.product_name_fr || "Produit inconnu",
        brand: product.brands || "",
        category: productCategory,
        image: product.image_url || product.image_front_url || undefined,
      },
    });
  } catch (err) {
    console.log("Open Food Facts proxy error:", err);
    return c.json({ product: null }, 500);
  }
});

// ===== AUTH ROUTES =====

// Sign up new user
app.post("/make-server-e298da7a/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error during user creation:', error);
      return c.json({ error: error.message }, 400);
    }

    const userId = data.user.id;

    // Create household for the user
    const householdId = crypto.randomUUID();
    const household = {
      id: householdId,
      name: `Foyer de ${name}`,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`household:${householdId}`, household);
    await kv.set(`household_members:${householdId}`, [userId]);

    // Create user profile
    const userProfile = {
      id: userId,
      email,
      name,
      householdId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userProfile);

    // Create a session for the new user (server-side, no CORS issues)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    // Sign in the user to get a session token
    const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.log('Error creating session after signup:', signInError);
      // Return success anyway, user can login manually
      return c.json({ 
        success: true, 
        user: { id: userId, email, name },
        householdId,
        message: 'Compte créé. Veuillez vous connecter.'
      });
    }

    return c.json({ 
      success: true, 
      user: { id: userId, email, name },
      householdId,
      token: signInData.session.access_token,
      access_token: signInData.session.access_token,
      session: {
        access_token: signInData.session.access_token,
        user: signInData.user
      }
    });
  } catch (error) {
    console.log('Unexpected error during signup:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Login - Authenticate user and return session token
app.post("/make-server-e298da7a/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Create a Supabase client for authentication (using anon key)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    // Authenticate user using Supabase Auth (server-side, no CORS issues)
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login error:', error.message);
      // Translate common errors to French
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
      }
      return c.json({ error: errorMessage }, 401);
    }

    if (!data.session) {
      return c.json({ error: 'Aucune session créée' }, 401);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${data.user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'Profil utilisateur non trouvé' }, 404);
    }

    return c.json({ 
      success: true,
      token: data.session.access_token,
      access_token: data.session.access_token,
      session: {
        access_token: data.session.access_token,
        user: data.user
      },
      user: userProfile
    });
  } catch (error) {
    console.log('Unexpected error during login:', error);
    return c.json({ error: 'Erreur serveur lors de la connexion' }, 500);
  }
});

// Sign in (legacy endpoint - kept for compatibility)
app.post("/make-server-e298da7a/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // This endpoint is called from frontend using Supabase client directly
    // This is just a helper to get user profile
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    console.log('Unexpected error during signin:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Get user profile
app.get("/make-server-e298da7a/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Profile request - Auth header present:', !!authHeader);
    
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      console.log('Profile request - No user found from token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Profile request - User authenticated:', user.id);
    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      console.log('Profile request - User profile not found in KV store for user:', user.id);
      return c.json({ error: 'User profile not found' }, 404);
    }

    const household = await kv.get(`household:${userProfile.householdId}`);
    const members = await kv.get(`household_members:${userProfile.householdId}`) || [];
    
    // Get member details
    const memberProfiles = await Promise.all(
      members.map((memberId: string) => kv.get(`user:${memberId}`))
    );

    console.log('Profile request - Success for user:', user.id);
    return c.json({ 
      user: userProfile, 
      household,
      members: memberProfiles.filter(Boolean)
    });
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return c.json({ error: 'Internal server error while fetching profile' }, 500);
  }
});

// ===== HOUSEHOLD ROUTES =====

// Create invitation code
app.post("/make-server-e298da7a/household/invite", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const invitation = {
      code: inviteCode,
      householdId: userProfile.householdId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    await kv.set(`invitation:${inviteCode}`, invitation);

    return c.json({ success: true, inviteCode });
  } catch (error) {
    console.log('Error creating invitation:', error);
    return c.json({ error: 'Internal server error while creating invitation' }, 500);
  }
});

// Join household with invite code
app.post("/make-server-e298da7a/household/join", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { inviteCode } = await c.req.json();
    
    if (!inviteCode) {
      return c.json({ error: 'Invite code is required' }, 400);
    }

    const invitation = await kv.get(`invitation:${inviteCode.toUpperCase()}`);
    
    if (!invitation) {
      return c.json({ error: 'Invalid invite code' }, 404);
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return c.json({ error: 'Invite code has expired' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const members = await kv.get(`household_members:${invitation.householdId}`) || [];
    
    // Check if user is already a member
    if (members.includes(user.id)) {
      return c.json({ error: 'Already a member of this household' }, 400);
    }

    // Update user's household
    userProfile.householdId = invitation.householdId;
    await kv.set(`user:${user.id}`, userProfile);

    // Add user to household members
    members.push(user.id);
    await kv.set(`household_members:${invitation.householdId}`, members);

    const household = await kv.get(`household:${invitation.householdId}`);

    return c.json({ success: true, household });
  } catch (error) {
    console.log('Error joining household:', error);
    return c.json({ error: 'Internal server error while joining household' }, 500);
  }
});

// Update household name
app.put("/make-server-e298da7a/household", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);
    const household = await kv.get(`household:${userProfile.householdId}`);
    
    household.name = name;
    await kv.set(`household:${userProfile.householdId}`, household);

    return c.json({ success: true, household });
  } catch (error) {
    console.log('Error updating household:', error);
    return c.json({ error: 'Internal server error while updating household' }, 500);
  }
});

// Remove member from household (only household owner can do this)
app.delete("/make-server-e298da7a/household/member/:memberId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberIdToRemove = c.req.param('memberId');
    const userProfile = await kv.get(`user:${user.id}`);
    const household = await kv.get(`household:${userProfile.householdId}`);

    // Check if the requester is the household owner
    if (household.createdBy !== user.id) {
      return c.json({ error: 'Only the household owner can remove members' }, 403);
    }

    // Prevent owner from removing themselves
    if (memberIdToRemove === user.id) {
      return c.json({ error: 'Cannot remove yourself from the household' }, 400);
    }

    // Get current members
    const members = await kv.get(`household_members:${userProfile.householdId}`) || [];
    
    // Check if member exists in household
    if (!members.includes(memberIdToRemove)) {
      return c.json({ error: 'Member not found in household' }, 404);
    }

    // Remove member from household
    const updatedMembers = members.filter((id: string) => id !== memberIdToRemove);
    await kv.set(`household_members:${userProfile.householdId}`, updatedMembers);

    // Create a new household for the removed member
    const removedMemberProfile = await kv.get(`user:${memberIdToRemove}`);
    if (removedMemberProfile) {
      const newHouseholdId = crypto.randomUUID();
      const newHousehold = {
        id: newHouseholdId,
        name: `Foyer de ${removedMemberProfile.name}`,
        createdBy: memberIdToRemove,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`household:${newHouseholdId}`, newHousehold);
      await kv.set(`household_members:${newHouseholdId}`, [memberIdToRemove]);
      
      // Update removed member's profile
      removedMemberProfile.householdId = newHouseholdId;
      await kv.set(`user:${memberIdToRemove}`, removedMemberProfile);
    }

    return c.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.log('Error removing household member:', error);
    return c.json({ error: 'Internal server error while removing member' }, 500);
  }
});

// ===== PRODUCT ROUTES =====

// Get all products for household
app.get("/make-server-e298da7a/products", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const products = await kv.get(`products:${userProfile.householdId}`) || [];

    return c.json({ products });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Internal server error while fetching products' }, 500);
  }
});

// Add product
app.post("/make-server-e298da7a/products", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productData = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);
    const products = await kv.get(`products:${userProfile.householdId}`) || [];
    
    const newProduct = {
      ...productData,
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await kv.set(`products:${userProfile.householdId}`, products);

    return c.json({ success: true, product: newProduct });
  } catch (error) {
    console.log('Error adding product:', error);
    return c.json({ error: 'Internal server error while adding product' }, 500);
  }
});

// Update product
app.put("/make-server-e298da7a/products/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    const updates = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);
    const products = await kv.get(`products:${userProfile.householdId}`) || [];
    
    const index = products.findIndex((p: any) => p.id === productId);
    
    if (index === -1) {
      return c.json({ error: 'Product not found' }, 404);
    }

    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`products:${userProfile.householdId}`, products);

    return c.json({ success: true, product: products[index] });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: 'Internal server error while updating product' }, 500);
  }
});

// Delete product
app.delete("/make-server-e298da7a/products/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    const userProfile = await kv.get(`user:${user.id}`);
    const products = await kv.get(`products:${userProfile.householdId}`) || [];
    
    const filteredProducts = products.filter((p: any) => p.id !== productId);
    await kv.set(`products:${userProfile.householdId}`, filteredProducts);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Internal server error while deleting product' }, 500);
  }
});

// ===== SHOPPING LIST ROUTES =====

// Get shopping list for household
app.get("/make-server-e298da7a/shopping-lists", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const shoppingLists = await kv.get(`shopping_lists:${userProfile.householdId}`) || [];

    return c.json({ shoppingLists });
  } catch (error) {
    console.log('Error fetching shopping lists:', error);
    return c.json({ error: 'Internal server error while fetching shopping lists' }, 500);
  }
});

// Add shopping item
app.post("/make-server-e298da7a/shopping-lists", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemData = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);
    const shoppingLists = await kv.get(`shopping_lists:${userProfile.householdId}`) || [];
    
    const newItem = {
      ...itemData,
      id: crypto.randomUUID(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    shoppingLists.push(newItem);
    await kv.set(`shopping_lists:${userProfile.householdId}`, shoppingLists);

    return c.json({ success: true, item: newItem });
  } catch (error) {
    console.log('Error adding shopping item:', error);
    return c.json({ error: 'Internal server error while adding shopping item' }, 500);
  }
});

// Update shopping item
app.put("/make-server-e298da7a/shopping-lists/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemId = c.req.param('id');
    const updates = await c.req.json();
    const userProfile = await kv.get(`user:${user.id}`);
    const shoppingLists = await kv.get(`shopping_lists:${userProfile.householdId}`) || [];
    
    const index = shoppingLists.findIndex((item: any) => item.id === itemId);
    
    if (index === -1) {
      return c.json({ error: 'Item not found' }, 404);
    }

    shoppingLists[index] = { ...shoppingLists[index], ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`shopping_lists:${userProfile.householdId}`, shoppingLists);

    return c.json({ success: true, item: shoppingLists[index] });
  } catch (error) {
    console.log('Error updating shopping item:', error);
    return c.json({ error: 'Internal server error while updating shopping item' }, 500);
  }
});

// Delete shopping item
app.delete("/make-server-e298da7a/shopping-lists/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getUserFromToken(authHeader);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemId = c.req.param('id');
    const userProfile = await kv.get(`user:${user.id}`);
    const shoppingLists = await kv.get(`shopping_lists:${userProfile.householdId}`) || [];
    
    const filteredItems = shoppingLists.filter((item: any) => item.id !== itemId);
    await kv.set(`shopping_lists:${userProfile.householdId}`, filteredItems);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting shopping item:', error);
    return c.json({ error: 'Internal server error while deleting shopping item' }, 500);
  }
});

Deno.serve(app.fetch);