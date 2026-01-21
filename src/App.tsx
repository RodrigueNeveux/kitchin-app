import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { BottomNav } from './components/BottomNav';
import { supabase } from './utils/supabase/client';
import { apiClient } from './utils/api';
import { toast } from "sonner";
import { demoProducts, demoShoppingList } from './utils/demoData';
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
  <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
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

// Fonction utilitaire pour éviter la duplication du code de filtrage
const filterShoppingList = (items: typeof demoShoppingList, listId: string): ShoppingItem[] => {
  return items
    .filter(item => item.listId === listId || (!item.listId && listId === 'main'))
    .map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      checked: item.checked,
      category: item.category,
      listId: listId as 'main' | 'next-week' | 'pharmacy',
    }));
};

const initializeShoppingLists = (): ShoppingLists => ({
  main: filterShoppingList(demoShoppingList, 'main'),
  'next-week': filterShoppingList(demoShoppingList, 'next-week'),
  pharmacy: filterShoppingList(demoShoppingList, 'pharmacy'),
});

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [shoppingLists, setShoppingLists] = useState<ShoppingLists>(initializeShoppingLists);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check for existing session on mount and listen to auth changes
  useEffect(() => {
    // MODE DÉMO : Pas de test de connexion API
    console.log('Mode démo - pas de connexion serveur requise');
    
    checkSession();
    
    // Listen for auth state changes (non utilisé en mode démo, mais conservé pour compatibilité)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
        setIsAuthenticated(true);
      } else {
        apiClient.setToken(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // MODE DÉMO : Les données sont déjà chargées au démarrage
      // loadUserData();
      console.log('📦 Mode démo activé - utilisation des données locales');
    }
  }, [isAuthenticated]);

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
      // MODE DÉMO : Pas de session persistante, toujours déconnecté au démarrage
      console.log('Mode démo - pas de session persistante');
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      // Load profile
      const profileData = await apiClient.getProfile();
      setUser(profileData.user);
      setHousehold(profileData.household);
      setMembers(profileData.members || []);

      // Load products
      const productsData = await apiClient.getProducts();
      const productsWithExpiry = (productsData.products || []).map((p: any) => ({
        ...p,
        daysUntilExpiry: p.expiryDate ? calculateDaysUntilExpiry(p.expiryDate) : undefined,
      }));
      setProducts(productsWithExpiry);

      // Load shopping lists
      const listsData = await apiClient.getShoppingLists();
      // TODO: Implement shopping lists loading from API
      // setShoppingLists(listsData.shoppingLists || {});
    } catch (error: any) {
      console.error('Error loading user data:', error);
      // If unauthorized, logout the user
      if (error.message?.includes('Unauthorized')) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        handleLogout();
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
      // MODE DÉMO : Connexion simplifiée sans serveur
      console.log('Mode démo - authentification locale');
      
      setUser({
        id: 'demo-user',
        email: email,
        name: name || 'Utilisateur Démo',
      });
      
      setHousehold({
        id: 'demo-household',
        name: 'Foyer Démo',
        createdBy: 'demo-user',
      });
      
      setMembers([{
        id: 'demo-user',
        email: email,
        name: name || 'Utilisateur Démo',
      }]);
      
      setIsAuthenticated(true);
      toast.success(isSignup ? 'Compte créé avec succès !' : 'Connexion réussie !');
      
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    // MODE DÉMO : Réinitialisation locale
    setIsAuthenticated(false);
    setUser(null);
    setHousehold(null);
    setMembers([]);
    setProducts(demoProducts);
    setShoppingLists(initializeShoppingLists());
    setActiveScreen('home');
    toast.success('Déconnexion réussie');
  }, []);

  const handleCreateInvite = useCallback(async (): Promise<string> => {
    console.log('handleCreateInvite appelé dans App.tsx');
    try {
      // MODE DÉMO : Génération d'un code d'invitation fictif
      const demoCode = 'KITCHIN' + Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('Code d\'invitation généré:', demoCode);
      
      toast.success('Code d\'invitation généré avec succès !', { 
        duration: 3000,
        position: 'top-center'
      });
      
      return demoCode;
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Erreur lors de la génération du code');
      throw error;
    }
  }, []);

  const handleJoinHousehold = useCallback(async (code: string) => {
    try {
      // MODE DÉMO : Fonctionnalité non disponible
      toast.info('Mode démo : Cette fonctionnalité nécessite un serveur', { duration: 3000 });
    } catch (error) {
      console.error('Error joining household:', error);
      toast.error('Erreur lors de la jonction au foyer');
      throw error;
    }
  }, []);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    try {
      // MODE DÉMO : Fonctionnalité non disponible
      toast.info('Mode démo : Cette fonctionnalité nécessite un serveur', { duration: 3000 });
    } catch (error: any) {
      console.error('Error removing member:', error);
      throw error;
    }
  }, []);

  // Product handlers
  const handleUpdateQuantity = useCallback(async (id: string, change: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const newQuantity = Math.max(1, product.quantity + change);
      
      // MODE DÉMO : Mise à jour locale uniquement
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, quantity: newQuantity } : p)
      );
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  }, [products]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      // MODE DÉMO : Suppression locale uniquement
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produit supprimé');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }, []);

  // Shopping list handlers
  const handleToggleItem = useCallback(async (listId: string, id: string) => {
    try {
      // MODE DÉMO : Mise à jour locale uniquement
      setShoppingLists((prev) => ({
        ...prev,
        [listId]: prev[listId as keyof ShoppingLists].map((i) => 
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      }));
    } catch (error) {
      console.error('Error toggling shopping item:', error);
    }
  }, [shoppingLists]);

  const handleDeleteItem = useCallback(async (listId: string, id: string) => {
    try {
      // MODE DÉMO : Suppression locale uniquement
      setShoppingLists((prev) => ({
        ...prev,
        [listId]: prev[listId as keyof ShoppingLists].filter((i) => i.id !== id),
      }));
      toast.success('Article supprimé');
    } catch (error) {
      console.error('Error deleting shopping item:', error);
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
      
      // MODE DÉMO : Ajout local uniquement
      const newItem = {
        id: `shop-demo-${Date.now()}`,
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
      console.error('Error adding shopping item:', error);
    }
  }, [shoppingLists]);

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
      console.error('Error moving shopping item:', error);
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

      // MODE DÉMO : Ajout local uniquement
      const newProduct = {
        id: `demo-${Date.now()}`,
        ...productData,
        daysUntilExpiry,
      };

      setProducts((prev) => [...prev, newProduct]);
      toast.success('Produit ajouté avec succès !');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
      throw error;
    }
  }, []);

  const handleUpdateHouseholdName = useCallback(async (name: string) => {
    try {
      // MODE DÉMO : Mise à jour locale uniquement
      setHousehold((prev: any) => ({ ...prev, name }));
      toast.success('Nom du foyer mis à jour');
    } catch (error: any) {
      console.error('Error updating household name:', error);
      throw error;
    }
  }, []);

  const handleUpdateEmail = useCallback(async (email: string) => {
    try {
      // MODE DÉMO : Mise à jour locale uniquement
      setUser((prev: any) => ({ ...prev, email }));
      toast.success('Email mis à jour');
    } catch (error: any) {
      console.error('Error updating email:', error);
      throw error;
    }
  }, []);

  const handleAddSampleIngredients = useCallback(async () => {
    const sampleIngredients = [
      // Frigo
      { name: 'Lait', quantity: 2, category: 'fridge' as const },
      { name: 'Œufs', quantity: 12, category: 'fridge' as const },
      { name: 'Beurre', quantity: 1, category: 'fridge' as const },
      { name: 'Fromage râpé', quantity: 1, category: 'fridge' as const },
      { name: 'Mozzarella', quantity: 2, category: 'fridge' as const },
      { name: 'Parmesan', quantity: 1, category: 'fridge' as const },
      { name: 'Crème fraîche', quantity: 2, category: 'fridge' as const },
      { name: 'Lardons', quantity: 1, category: 'fridge' as const },
      { name: 'Poulet', quantity: 1, category: 'fridge' as const },
      { name: 'Viande hachée', quantity: 1, category: 'fridge' as const },
      { name: 'Carottes', quantity: 5, category: 'fridge' as const },
      { name: 'Tomates', quantity: 6, category: 'fridge' as const },
      { name: 'Oignon', quantity: 4, category: 'fridge' as const },
      { name: 'Ail', quantity: 1, category: 'fridge' as const },
      { name: 'Laitue romaine', quantity: 2, category: 'fridge' as const },
      { name: 'Courgettes', quantity: 3, category: 'fridge' as const },
      { name: 'Poivrons', quantity: 2, category: 'fridge' as const },
      { name: 'Aubergines', quantity: 2, category: 'fridge' as const },
      { name: 'Citron', quantity: 3, category: 'fridge' as const },
      { name: 'Pommes', quantity: 6, category: 'fridge' as const },
      { name: 'Mascarpone', quantity: 1, category: 'fridge' as const },
      
      // Placard
      { name: 'Spaghetti', quantity: 2, category: 'pantry' as const },
      { name: 'Pâtes', quantity: 3, category: 'pantry' as const },
      { name: 'Riz', quantity: 2, category: 'pantry' as const },
      { name: 'Farine', quantity: 1, category: 'pantry' as const },
      { name: 'Sucre', quantity: 1, category: 'pantry' as const },
      { name: 'Sel', quantity: 1, category: 'pantry' as const },
      { name: 'Poivre', quantity: 1, category: 'pantry' as const },
      { name: 'Huile d\'olive', quantity: 1, category: 'pantry' as const },
      { name: 'Sauce tomate', quantity: 3, category: 'pantry' as const },
      { name: 'Chocolat noir', quantity: 2, category: 'pantry' as const },
      { name: 'Lait de coco', quantity: 2, category: 'pantry' as const },
      { name: 'Curry en poudre', quantity: 1, category: 'pantry' as const },
      { name: 'Herbes de Provence', quantity: 1, category: 'pantry' as const },
      { name: 'Thym', quantity: 1, category: 'pantry' as const },
      { name: 'Romarin', quantity: 1, category: 'pantry' as const },
      { name: 'Basilic', quantity: 1, category: 'pantry' as const },
      { name: 'Origan', quantity: 1, category: 'pantry' as const },
      { name: 'Cannelle', quantity: 1, category: 'pantry' as const },
      { name: 'Muscade', quantity: 1, category: 'pantry' as const },
      { name: 'Levure chimique', quantity: 1, category: 'pantry' as const },
      { name: 'Café', quantity: 1, category: 'pantry' as const },
      { name: 'Cacao en poudre', quantity: 1, category: 'pantry' as const },
      { name: 'Confiture d\'abricot', quantity: 1, category: 'pantry' as const },
      { name: 'Biscuits à la cuillère', quantity: 1, category: 'pantry' as const },
      
      // Congélateur
      { name: 'Pommes de terre', quantity: 3, category: 'freezer' as const },
      { name: 'Steaks de bœuf', quantity: 4, category: 'freezer' as const },
    ];

    try {
      toast.info('Ajout des ingrédients en cours...');
      
      for (const ingredient of sampleIngredients) {
        try {
          await handleAddProduct(ingredient);
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error adding ${ingredient.name}:`, error);
        }
      }
      
      toast.success('Ingrédients de base ajoutés avec succès !');
    } catch (error) {
      console.error('Error adding sample ingredients:', error);
      toast.error('Erreur lors de l\'ajout des ingrédients');
    }
  }, [handleAddProduct]);

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
        <AuthScreen onAuth={handleAuth} />
      </Suspense>
    );
  }

  return (
    <div className={`min-h-screen w-full sm:max-w-md sm:mx-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} relative sm:shadow-2xl`}>
      {/* Bannière Mode Démo */}
      <div className="bg-blue-500 text-white text-center py-2 px-4 text-sm sticky top-0 z-50">
        <span className="inline-flex items-center gap-2">
          <span>📱</span>
          <span>Mode Démo - Données locales</span>
        </span>
      </div>
      
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
            onAddSampleIngredients={handleAddSampleIngredients}
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
            onSettingsClick={() => setActiveScreen('settings')}
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
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
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
