import { Clock, Users, ChefHat, CheckCircle2, Search, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { findRecipesByIngredients, searchRecipes, isApiConfigured } from '../utils/spoonacularApi';
import { searchMealDbRecipes } from '../utils/mealDbApi';
import { translateText } from '../utils/translationApi';
import { toast } from "sonner";

// Lazy load des recettes françaises (chargement différé)
const loadFrenchRecipes = async () => {
  const { frenchRecipes } = await import('../utils/recipesData');
  return frenchRecipes;
};

export interface Recipe {
  id: string;
  name: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  ingredients: { item: string; quantity: string }[];
  steps: string[];
  category: string;
  // Propriétés pour l'API Spoonacular
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: string[];
  usedIngredients?: string[];
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

interface RecipesScreenProps {
  onRecipeClick: (recipe: Recipe) => void;
  availableProducts?: Product[];
}

// Variables pour stocker les recettes chargées (lazy loading)
let cachedFrenchRecipes: Recipe[] | null = null;
let loadingPromise: Promise<Recipe[]> | null = null;


// Fonction pour charger les recettes françaises de manière lazy
async function getFrenchRecipes(): Promise<Recipe[]> {
  if (cachedFrenchRecipes) {
    return cachedFrenchRecipes;
  }
  
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = loadFrenchRecipes();
  cachedFrenchRecipes = await loadingPromise;
  loadingPromise = null;
  
  return cachedFrenchRecipes;
}

const RECIPE_CATEGORIES = ['Toutes', 'Plat principal', 'Entrée', 'Accompagnement', 'Dessert', 'Soupe', 'Salade'] as const;

export function RecipesScreen({ onRecipeClick, availableProducts = [] }: RecipesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'can-make' | 'missing-few'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('Toutes');

  const apiConfigured = isApiConfigured();

  // Convertir les produits en liste d'ingrédients pour l'API
  const inventoryIngredients = useMemo(() => {
    return availableProducts.map(p => p.name.toLowerCase());
  }, [availableProducts]);

  // Charger les recettes basées sur l'inventaire
  const loadRecipesFromInventory = async () => {
    setLoading(true);
    try {
      const spoonacularRecipes = await findRecipesByIngredients(inventoryIngredients, 20, 1);
      
      
      // Traduire tous les titres automatiquement
      const titles = spoonacularRecipes.map(r => r.title);
      const translatedTitles = await Promise.all(titles.map(title => translateText(title)));
      
      // Convertir les recettes Spoonacular en format Recipe avec traduction automatique
      const convertedRecipes: Recipe[] = spoonacularRecipes.map((r, idx) => ({
        id: r.id.toString(),
        name: translatedTitles[idx], // Traduction automatique du titre
        image: r.image,
        prepTime: 0,
        cookTime: r.readyInMinutes || 30,
        servings: r.servings || 4,
        difficulty: 'Moyen' as const,
        category: 'Plat principal',
        ingredients: [],
        steps: [],
        usedIngredientCount: r.usedIngredientCount || 0,
        missedIngredientCount: r.missedIngredientCount || 0,
        missedIngredients: r.missedIngredients?.map(i => i.name) || [], // Garde l'anglais ici, sera traduit dans DetailScreen
        usedIngredients: r.usedIngredients?.map(i => i.name) || [], // Garde l'anglais ici, sera traduit dans DetailScreen
      }));

      setRecipes(convertedRecipes);
      setBaseRecipes(convertedRecipes);
      toast.success(`${convertedRecipes.length} recettes trouvées !`);
    } catch (error) {
      toast.error('Erreur lors du chargement des recettes');
      // Fallback sur les recettes françaises
      const fallbackRecipes = await getFrenchRecipes();
      setRecipes(fallbackRecipes);
    } finally {
      setLoading(false);
    }
  };

  // Charger les recettes : uniquement selon l'inventaire
  useEffect(() => {
    if (inventoryIngredients.length > 0 && apiConfigured) {
      setLoading(true);
      loadRecipesFromInventory();
    } else {
      setRecipes([]);
      setBaseRecipes([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryIngredients.length, apiConfigured]);

  const [baseRecipes, setBaseRecipes] = useState<Recipe[]>([]);
  const baseRecipesRef = useRef<Recipe[]>([]);
  baseRecipesRef.current = baseRecipes;

  // Recherche en temps réel avec debounce : TheMealDB + Spoonacular (si configuré)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      if (baseRecipesRef.current.length > 0) {
        setRecipes(baseRecipesRef.current);
      }
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setSearchLoading(true);
      const search = async () => {
      try {
        const [mealDbRecipes, spoonacularData] = await Promise.all([
          searchMealDbRecipes(q, 20),
          apiConfigured ? searchRecipes(q, 10).then(d => d.results).catch(() => []) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        const mealDbAsRecipe: Recipe[] = mealDbRecipes.map(r => ({ ...r }));
        const spoonacularAsRecipe: Recipe[] = (spoonacularData || []).map((r: any) => ({
          id: (r.id?.toString() || `sp-${r.id}`),
          name: r.title || r.name || '',
          image: r.image || '',
          prepTime: 0,
          cookTime: r.readyInMinutes || 30,
          servings: r.servings || 4,
          difficulty: 'Moyen' as const,
          category: 'Plat principal',
          ingredients: [],
          steps: [],
        }));
        const combined = [...mealDbAsRecipe];
        const seen = new Set(combined.map(r => r.name.toLowerCase()));
        spoonacularAsRecipe.forEach(r => {
          if (r.name && !seen.has(r.name.toLowerCase())) {
            seen.add(r.name.toLowerCase());
            combined.push(r);
          }
        });
        const base = baseRecipesRef.current;
        const localMatches = base.filter(r =>
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          (r.category && r.category.toLowerCase().includes(q.toLowerCase()))
        );
        const localIds = new Set(localMatches.map(x => x.id));
        const fromApi = combined.filter(x => !localIds.has(x.id));
        setRecipes([...localMatches, ...fromApi]);
      } catch (e) {
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };
      search();
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, apiConfigured]);

  // Les recettes sont basées sur l'inventaire (API Spoonacular) avec usedIngredientCount, missedIngredientCount
  const recipesWithAvailability = useMemo(() => recipes, [recipes]);

  // Filtrer les recettes selon la recherche, catégorie et filtres
  const filteredRecipes = useMemo(() => {
    let filtered = recipesWithAvailability;

    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.category && recipe.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter && categoryFilter !== 'Toutes') {
      filtered = filtered.filter(recipe =>
        recipe.category && recipe.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    if (filter === 'can-make') {
      filtered = filtered.filter(recipe => (recipe.missedIngredientCount || 0) === 0);
    } else if (filter === 'missing-few') {
      filtered = filtered.filter(recipe => 
        (recipe.missedIngredientCount || 0) > 0 && (recipe.missedIngredientCount || 0) <= 3
      );
    }

    return filtered;
  }, [recipesWithAvailability, searchQuery, filter, categoryFilter]);

  // Statistiques
  const stats = useMemo(() => {
    const canMake = recipesWithAvailability.filter(r => (r.missedIngredientCount || 0) === 0).length;
    const missingFew = recipesWithAvailability.filter(r => 
      (r.missedIngredientCount || 0) > 0 && (r.missedIngredientCount || 0) <= 3
    ).length;
    
    return { canMake, missingFew, total: recipesWithAvailability.length };
  }, [recipesWithAvailability]);

  return (
    <div className="flex flex-col h-screen bg-stone-200">
                  {/* Header */}
                  <header className="bg-stone-100 px-4 sm:px-6 py-4 shadow-sm border-b border-stone-300 md:sticky md:top-0 md:z-10 flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-center text-stone-800 mb-4">
                        🍳 Recettes
                      </h1>
            
                      {/* Search Bar */}
                      <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
                          <input
                            type="text"
                            placeholder="Rechercher une recette..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800"
                          />
                        </div>
            
                        {/* État de la recherche */}
                        {(loading || searchLoading) && (
                          <div className="w-full mb-4 px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-stone-200">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{searchLoading ? 'Recherche...' : 'Chargement...'}</span>
                          </div>
                        )}
                      {/* Filtre par catégorie */}
                      <div className="mb-3">
                        <p className="text-xs text-stone-600 mb-1">Catégorie</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {RECIPE_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setCategoryFilter(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-300 ${
                                categoryFilter === cat
                                  ? 'bg-green-600 text-white'
                                  : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Filters */}
                      {availableProducts.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                              filter === 'all'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                            }`}
                          >
                            Toutes ({stats.total})
                          </button>
                          <button
                            onClick={() => setFilter('can-make')}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                              filter === 'can-make'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                            }`}
                          >
                            ✅ Je peux faire ({stats.canMake})
                          </button>
                          <button
                            onClick={() => setFilter('missing-few')}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                              filter === 'missing-few'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                            }`}
                          >
                            ⚠️ Quelques ingrédients manquants ({stats.missingFew})
                          </button>
                        </div>
                      )}
                    </div>
                  </header>      {/* Recipes Grid */}
      <div className="content-with-nav flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-20">
              <ChefHat className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <p className="text-stone-600 mb-2">
                {availableProducts.length === 0
                  ? 'Ajoutez des ingrédients à votre inventaire pour voir des recettes personnalisées'
                  : 'Aucune recette trouvée'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => onRecipeClick(recipe)}
                  showIngredientMatch={availableProducts.length > 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  showIngredientMatch?: boolean;
}

function RecipeCard({ recipe, onClick, showIngredientMatch }: RecipeCardProps) {
  const canMake = (recipe.missedIngredientCount || 0) === 0;
  const missingFew = (recipe.missedIngredientCount || 0) > 0 && (recipe.missedIngredientCount || 0) <= 3;

  return (
    <div
      onClick={onClick}
      className="bg-stone-100 shadow-md border border-stone-300 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge de correspondance */}
        {showIngredientMatch && canMake && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            Vous avez tout !
          </div>
        )}
        
        {showIngredientMatch && missingFew && recipe.missedIngredientCount && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
            {recipe.missedIngredientCount} ingrédient(s) manquant(s)
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-stone-800 mb-3 line-clamp-2">
          {recipe.name}
        </h3>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-stone-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} pers.</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>

        {/* Ingredient match details */}
        {showIngredientMatch && (recipe.usedIngredientCount || 0) > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-300">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">
                ✓ {recipe.usedIngredientCount} ingrédient(s) disponible(s)
              </span>
              {(recipe.missedIngredientCount || 0) > 0 && (
                <span className="text-orange-600">
                  ✗ {recipe.missedIngredientCount} ingrédient(s) manquant(s)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
