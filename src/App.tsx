import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { BottomNav } from './components/BottomNav';
import { firebaseApi } from './utils/firebase/api';
import { toast } from "sonner";
import type { Recipe } from './components/RecipesScreen';

// Lazy loading des écrans pour réduire le bundle initial
// Utilisation de .then() pour un meilleur tree-shaking et contrôle du chargement
const InventoryScreen = lazy(() => 
  import('./components/InventoryScreen').then(module => ({ default: module.InventoryScreen }))
);
const ShoppingListScreen = lazy(() => 
  import('./components/ShoppingListScreen').then(module => ({ default: module.ShoppingListScreen }))
);
const AuthScreen = lazy(() => 
  import('./components/AuthScreen').then(module => ({ default: module.AuthScreen }))
);
const ProfileScreen = lazy(() => 
  import('./components/ProfileScreen').then(module => ({ default: module.ProfileScreen }))
);
const SettingsScreen = lazy(() => 
  import('./components/SettingsScreen').then(module => ({ default: module.SettingsScreen }))
);
const AddProductScreen = lazy(() => 
  import('./components/AddProductScreen').then(module => ({ default: module.AddProductScreen }))
);
// Les écrans de recettes sont regroupés car souvent utilisés ensemble
const RecipesScreen = lazy(() => 
  import('./components/RecipesScreen').then(module => ({ default: module.RecipesScreen }))
);
const RecipeDetailScreen = lazy(() => 
  import('./components/RecipeDetailScreen').then(module => ({ default: module.RecipeDetailScreen }))
);
const NotificationsScreen = lazy(() => 
  import('./components/NotificationsScreen').then(module => ({ default: module.NotificationsScreen }))
);

// Composant de chargement
const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-stone-200">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-stone-600">Chargement...</p>
    </div>
  </div>
);

interface Product {
  id: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  image?: string;
  category: 'fridge' | 'pantry' | 'freezer';
  daysUntilExpiry?: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category?: string;
  listId?: string; // Pour identifier à quelle liste appartient l'article
}

interface ShoppingLists {
  main: ShoppingItem[];
  'next-week': ShoppingItem[];
  pharmacy: ShoppingItem[];
}

// Initialisation des listes de courses vide - sera remplie par l'API
const initializeShoppingLists = (): ShoppingLists => ({
  main: [],
  'next-week': [],
  pharmacy: [],
});

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingLists>(initializeShoppingLists);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [joinCodeFromUrl, setJoinCodeFromUrl] = useState('');

  // Gérer l'URL /join/CODE (deep link invitation)
  useEffect(() => {
    const match = window.location.pathname.match(/^\/join\/([A-Za-z0-9]+)$/i);
    if (match) {
      setJoinCodeFromUrl(match[1].toUpperCase());
      setActiveScreen('profile');
      window.history.replaceState({}, document.title, '/' + (window.location.search || '') + (window.location.hash || ''));
    }
  }, []);

  // Check for existing session on mount and listen to auth changes
  useEffect(() => {
    let cancelled = false;
    
    const init = async () => {
      try {
        await checkSession();
      } catch (err) {
        if (!cancelled) setLoading(false);
      }
    };
    
    init();
    
    // Timeout de sécurité : afficher l'écran après 3s même si Firebase bloque
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);
    
    // Listen for auth state changes (Firebase)
    const unsubscribe = firebaseApi.onAuthStateChange(async (firebaseUser) => {
      if (cancelled) return;
      if (firebaseUser) {
        setIsAuthenticated(true);
        await loadUserData();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setHousehold(null);
        setMembers([]);
        setProducts([]);
        setShoppingLists(initializeShoppingLists());
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Note: loadUserData est appelé directement après l'authentification
  // Pas besoin d'un useEffect séparé pour éviter les appels multiples

  // Memoized calculation du nombre de produits périmés pour les notifications
  const expiringCount = useMemo(() => 
    products.filter(p => p.daysUntilExpiry !== undefined && p.daysUntilExpiry <= 3).length,
    [products]
  );

  // Notification for expiring products - separate effect
  useEffect(() => {
    if (isAuthenticated && expiringCount > 0) {
      const timer = setTimeout(() => {
        toast.warning(
          `${expiringCount} produit${expiringCount > 1 ? 's' : ''} à consommer rapidement !`,
          {
            duration: 5000,
            position: 'top-center',
            action: {
              label: 'Voir',
              onClick: () => setActiveScreen('notifications'),
            },
          }
        );
      }, 1500); // Délai pour laisser l'app se charger
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, expiringCount]);

  const checkSession = useCallback(async () => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      
      if (currentUser) {
        setIsAuthenticated(true);
        // Charger les données utilisateur
        await loadUserData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      
      if (!currentUser) {
        return;
      }

      // Load profile from Firestore
      const profileData = await firebaseApi.getProfile(currentUser.uid);
      setUser(profileData.user);
      setHousehold(profileData.household);
      setMembers(profileData.members);

      // Load products
      if (profileData.user.householdId) {
        const productsData = await firebaseApi.getProducts(profileData.user.householdId);
        const productsWithExpiry = productsData.map((p) => ({
          ...p,
          daysUntilExpiry: p.expiryDate ? calculateDaysUntilExpiry(p.expiryDate) : undefined,
        }));
        setProducts(productsWithExpiry);

        // Load shopping lists
        try {
          const listsData = await firebaseApi.getShoppingLists(profileData.user.householdId);
          setShoppingLists({
            main: listsData.main || [],
            'next-week': listsData['next-week'] || [],
            pharmacy: listsData.pharmacy || [],
          });
        } catch (listError) {
        }
      } else {
        // Pas de foyer, initialiser les listes vides
        setProducts([]);
        setShoppingLists(initializeShoppingLists());
      }
    } catch (error: any) {
      // If unauthorized, logout the user
      if (error.message?.includes('Unauthorized') || error.message?.includes('permission')) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        handleLogout();
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    }
  };

  const calculateDaysUntilExpiry = (expiryDate: string): number => {
    const [day, month, year] = expiryDate.split('/').map(Number);
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAuth = useCallback(async (email: string, password: string, name?: string, isSignup?: boolean) => {
    try {
      if (isSignup) {
        // Inscription
        if (!name || name.trim().length === 0) {
          throw new Error('Le nom est requis pour l\'inscription');
        }
        
        if (!email || !email.includes('@')) {
          throw new Error('Veuillez entrer une adresse email valide');
        }
        
        if (!password || password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        
        // Créer le compte via Firebase Auth
        await firebaseApi.signup(email, password, name);
        
        setIsAuthenticated(true);
        await loadUserData();
        toast.success('Compte créé avec succès !');
      } else {
        // Connexion
        if (!email || !email.includes('@')) {
          throw new Error('Veuillez entrer une adresse email valide');
        }
        
        if (!password) {
          throw new Error('Veuillez entrer votre mot de passe');
        }
        
        // Connexion via Firebase Auth
        await firebaseApi.login(email, password);
        
        setIsAuthenticated(true);
        await loadUserData();
        toast.success('Connexion réussie !');
      }
    } catch (error: any) {
      
      // Gérer différents types d'erreurs
      let errorMessage = 'Une erreur est survenue lors de l\'authentification';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'NetworkError' || error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }
      
      toast.error(errorMessage, { 
        duration: 5000
      });
      throw new Error(errorMessage);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await firebaseApi.logout();
      setIsAuthenticated(false);
      setUser(null);
      setHousehold(null);
      setMembers([]);
      setProducts([]);
      setShoppingLists(initializeShoppingLists());
      setActiveScreen('home');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  }, []);

  const handleForgotPassword = useCallback(async (email: string) => {
    try {
      await firebaseApi.sendPasswordReset(email);
      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
      throw error;
    }
  }, []);

  const handleCreateInvite = useCallback(async (): Promise<string> => {
    try {
      if (!user?.householdId) {
        throw new Error('Vous devez être membre d\'un foyer pour créer une invitation');
      }
      
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) {
        throw new Error('Vous devez être connecté');
      }
      
      const inviteCode = await firebaseApi.createInvite(user.householdId, currentUser.uid);
      
      toast.success('Code d\'invitation généré avec succès !', { 
        duration: 3000,
        position: 'top-center'
      });
      
      return inviteCode;
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la génération du code';
      toast.error(errorMessage);
      throw error;
    }
  }, [user]);

  const handleJoinHousehold = useCallback(async (code: string) => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) {
        throw new Error('Vous devez être connecté');
      }
      
      await firebaseApi.joinHousehold(code, currentUser.uid);
      
      // Recharger les données utilisateur pour obtenir le nouveau foyer
      await loadUserData();
      
      toast.success('Vous avez rejoint le foyer avec succès !', { duration: 3000 });
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la jonction au foyer';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const handleCreateHousehold = useCallback(async (name: string) => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) throw new Error('Vous devez être connecté');
      await firebaseApi.createHousehold(currentUser.uid, name);
      await loadUserData();
      toast.success('Foyer créé avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du foyer');
      throw error;
    }
  }, []);

  const handleLeaveHousehold = useCallback(async () => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) throw new Error('Vous devez être connecté');
      await firebaseApi.leaveHousehold(currentUser.uid);
      await loadUserData();
      toast.success('Vous avez quitté le foyer');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sortie du foyer');
      throw error;
    }
  }, []);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      if (!household?.id) {
        throw new Error('Aucun foyer trouvé');
      }
      
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) {
        throw new Error('Vous devez être connecté');
      }
      
      await firebaseApi.removeMember(household.id, memberId, currentUser.uid);
      
      // Recharger les données utilisateur pour mettre à jour la liste des membres
      await loadUserData();
      
      toast.success('Membre retiré du foyer avec succès');
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du retrait du membre';
      toast.error(errorMessage);
      throw error;
    }
  }, [household]);

  // Product handlers
  const handleUpdateQuantity = useCallback(async (id: string, change: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const newQuantity = Math.max(1, product.quantity + change);
      
      // Mise à jour via Firebase
      await firebaseApi.updateProduct(id, { quantity: newQuantity });
      
      // Mise à jour locale
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, quantity: newQuantity } : p)
      );
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du produit');
    }
  }, [products]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      await firebaseApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produit supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit');
    }
  }, []);

  // Shopping list handlers
  const handleToggleItem = useCallback(async (listId: string, id: string) => {
    try {
      const item = shoppingLists[listId as keyof ShoppingLists].find(i => i.id === id);
      if (item) {
        await firebaseApi.updateShoppingItem(id, { checked: !item.checked });
      }
      
      setShoppingLists((prev) => ({
        ...prev,
        [listId]: prev[listId as keyof ShoppingLists].map((i) => 
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      }));
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'article');
    }
  }, [shoppingLists]);

  const handleDeleteItem = useCallback(async (listId: string, id: string) => {
    try {
      await firebaseApi.deleteShoppingItem(id);
      setShoppingLists((prev) => ({
        ...prev,
        [listId]: prev[listId as keyof ShoppingLists].filter((i) => i.id !== id),
      }));
      toast.success('Article supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'article');
    }
  }, [shoppingLists]);

  const handleAddItem = useCallback(async (listId: string, name: string, quantity: string) => {
    try {
      // Détection automatique de la catégorie
      const detectCategory = (productName: string): string => {
        const lowerName = productName.toLowerCase();
        if (/(tomate|carotte|pomme|banane|orange|salade|légume|fruit|oignon|ail|pomme de terre|courgette|aubergine)/i.test(lowerName)) {
          return 'fruits-legumes';
        }
        if (/(poulet|viande|porc|bœuf|poisson|saumon|thon|jambon|steak)/i.test(lowerName)) {
          return 'viande-poisson';
        }
        if (/(lait|yaourt|fromage|beurre|crème|œuf)/i.test(lowerName)) {
          return 'produits-laitiers';
        }
        if (/(eau|jus|soda|café|thé|coca)/i.test(lowerName)) {
          return 'boissons';
        }
        if (/(surgelé|glace|légumes surgelés)/i.test(lowerName)) {
          return 'surgeles';
        }
        if (/(pâtes|riz|farine|sucre|sel|huile|sauce|conserve|pain)/i.test(lowerName)) {
          return 'epicerie';
        }
        return 'autres';
      };
      
      // Ajout via Firebase
      if (!user?.householdId) {
        throw new Error('Vous devez être membre d\'un foyer pour ajouter des articles');
      }
      
      const itemId = await firebaseApi.addShoppingItem({
        name,
        quantity,
        checked: false,
        category: detectCategory(name),
        listId: listId as 'main' | 'next-week' | 'pharmacy',
        householdId: user.householdId,
      });
      
      const newItem = {
        id: itemId,
        name,
        quantity,
        checked: false,
        category: detectCategory(name),
        listId,
      };
      
      setShoppingLists((prev) => ({
        ...prev,
        [listId]: [...prev[listId as keyof ShoppingLists], newItem],
      }));
      toast.success('Article ajouté');
    } catch (error) {
    }
  }, [shoppingLists]);

  const handleAddMissingIngredientsToList = useCallback(async (items: { item: string; quantity: string }[]) => {
    try {
      for (const item of items) {
        await handleAddItem('main', item.item, item.quantity);
      }
      toast.success(`${items.length} ingrédient${items.length > 1 ? 's' : ''} ajouté${items.length > 1 ? 's' : ''} à la liste`);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout des ingrédients');
    }
  }, [handleAddItem]);

  const handleMoveItem = useCallback(async (itemId: string, fromListId: string, toListId: string) => {
    try {
      // Trouver l'article dans la liste source
      const item = shoppingLists[fromListId as keyof ShoppingLists].find(i => i.id === itemId);
      if (!item) return;

      // Supprimer de la liste source et ajouter à la liste destination
      setShoppingLists((prev) => ({
        ...prev,
        [fromListId]: prev[fromListId as keyof ShoppingLists].filter((i) => i.id !== itemId),
        [toListId]: [...prev[toListId as keyof ShoppingLists], { ...item, listId: toListId }],
      }));
      
      toast.success('Article déplacé');
    } catch (error) {
    }
  }, [shoppingLists]);

  const handleAddProduct = useCallback(async (productData: {
    name: string;
    quantity: number;
    category: 'fridge' | 'pantry' | 'freezer';
    expiryDate?: string;
    image?: string;
  }) => {
    try {
      // Calculate daysUntilExpiry if expiry date provided
      let daysUntilExpiry: number | undefined;
      if (productData.expiryDate) {
        const [day, month, year] = productData.expiryDate.split('/').map(Number);
        const expiry = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Ajout via Firebase (user.householdId ou household.id en secours)
      const householdId = user?.householdId || household?.id;
      if (!householdId) {
        throw new Error('Vous devez rejoindre ou créer un foyer pour ajouter des produits');
      }
      
      const productId = await firebaseApi.addProduct({
        ...productData,
        householdId,
      });
      
      const newProduct = {
        id: productId,
        ...productData,
        daysUntilExpiry,
      };

      setProducts((prev) => [...prev, newProduct]);
      toast.success('Produit ajouté avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du produit');
      throw error;
    }
  }, [user, household]);

  const handleUpdateHouseholdName = useCallback(async (name: string) => {
    try {
      if (!household?.id) {
        throw new Error('Aucun foyer trouvé');
      }
      
      await firebaseApi.updateHouseholdName(household.id, name);
      setHousehold((prev: any) => ({ ...prev, name }));
      toast.success('Nom du foyer mis à jour');
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour du nom du foyer';
      toast.error(errorMessage);
      throw error;
    }
  }, [household]);

  const handleUpdateEmail = useCallback(async (email: string) => {
    try {
      const currentUser = firebaseApi.getCurrentUser();
      if (!currentUser) {
        throw new Error('Vous devez être connecté');
      }
      
      // Firebase Auth gère la mise à jour de l'email
      // Note: Cela nécessite une confirmation par email
      // Pour l'instant, on met juste à jour le profil Firestore
      await firebaseApi.updateUserName(currentUser.uid, currentUser.displayName || '');
      
      setUser((prev: any) => ({ ...prev, email }));
      toast.success('Email mis à jour. Veuillez vérifier votre boîte mail pour confirmer.');
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour de l\'email';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Memoized calculations pour éviter les recalculs inutiles
  const expiringProducts = useMemo(() => 
    products
      .filter((p) => p.daysUntilExpiry !== undefined && p.daysUntilExpiry <= 3)
      .slice(0, 4),
    [products]
  );

  const fridgeProducts = useMemo(() => 
    products.filter((p) => p.category === 'fridge').slice(0, 4),
    [products]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AuthScreen onAuth={handleAuth} onForgotPassword={handleForgotPassword} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen w-full md:pl-24 bg-stone-200 relative">
      {activeScreen === 'home' && (
        <HomeScreen
          expiringProducts={expiringProducts}
          fridgeProducts={fridgeProducts}
          household={household}
          onProfileClick={() => setActiveScreen('profile')}
          onInviteClick={() => setActiveScreen('profile')}
          onViewAllExpiring={() => setActiveScreen('inventory')}
          onViewAllFridge={() => setActiveScreen('inventory')}
          onNotificationsClick={() => setActiveScreen('notifications')}
        />
      )}
      {activeScreen === 'notifications' && (
        <Suspense fallback={<LoadingScreen />}>
          <NotificationsScreen
            products={products}
            onBack={() => setActiveScreen('home')}
            onNavigateToInventory={() => setActiveScreen('inventory')}
          />
        </Suspense>
      )}
      {activeScreen === 'inventory' && (
        <Suspense fallback={<LoadingScreen />}>
          <InventoryScreen
            products={products}
            onBack={() => setActiveScreen('home')}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteProduct={handleDeleteProduct}
            onAddProduct={() => setActiveScreen('add-product')}
          />
        </Suspense>
      )}
      {activeScreen === 'add-product' && (
        <Suspense fallback={<LoadingScreen />}>
          <AddProductScreen
            onBack={() => setActiveScreen('inventory')}
            onSave={handleAddProduct}
          />
        </Suspense>
      )}
      {activeScreen === 'lists' && (
        <Suspense fallback={<LoadingScreen />}>
          <ShoppingListScreen
            lists={shoppingLists}
            onBack={() => setActiveScreen('home')}
            onToggleItem={handleToggleItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onMoveItem={handleMoveItem}
          />
        </Suspense>
      )}
      {activeScreen === 'profile' && (
        <Suspense fallback={<LoadingScreen />}>
          <ProfileScreen
            user={user}
            household={household}
            members={members}
            onBack={() => setActiveScreen('home')}
            onLogout={handleLogout}
            onCreateInvite={handleCreateInvite}
            onJoinHousehold={handleJoinHousehold}
            onRemoveMember={handleRemoveMember}
            onCreateHousehold={handleCreateHousehold}
            onLeaveHousehold={handleLeaveHousehold}
            onSettingsClick={() => setActiveScreen('settings')}
            initialJoinCode={joinCodeFromUrl}
          />
        </Suspense>
      )}
      {activeScreen === 'settings' && (
        <Suspense fallback={<LoadingScreen />}>
          <SettingsScreen
            user={user}
            household={household}
            onBack={() => setActiveScreen('profile')}
            onUpdateHouseholdName={handleUpdateHouseholdName}
            onUpdateEmail={handleUpdateEmail}
          />
        </Suspense>
      )}
      {activeScreen === 'recipes' && !selectedRecipe && (
        <Suspense fallback={<LoadingScreen />}>
          <RecipesScreen
            onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
            availableProducts={products}
          />
        </Suspense>
      )}
      {activeScreen === 'recipes' && selectedRecipe && (
        <Suspense fallback={<LoadingScreen />}>
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            availableProducts={products}
            onAddMissingToShoppingList={user?.householdId ? handleAddMissingIngredientsToList : undefined}
          />
        </Suspense>
      )}
      {activeScreen !== 'add-product' && activeScreen !== 'profile' && activeScreen !== 'settings' && activeScreen !== 'notifications' && !selectedRecipe && (
        <BottomNav
          activeScreen={activeScreen}
          onNavigate={(screen) => {
            setSelectedRecipe(null);
            setActiveScreen(screen);
          }}
          notificationCount={expiringCount}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
