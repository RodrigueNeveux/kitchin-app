import { ArrowLeft, Clock, Users, ChefHat, CheckCircle2, Check, Loader2, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useMemo, useEffect } from 'react';
import type { Recipe } from './RecipesScreen';
import { getRecipeDetails, type RecipeDetails } from '../utils/spoonacularApi';
import { translateIngredient, translateStep } from '../utils/recipesData';
import { translateText, translateTexts } from '../utils/translationApi';

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  availableProducts?: Product[];
  onAddMissingToShoppingList?: (items: { item: string; quantity: string }[]) => void;
  darkMode?: boolean;
}

export function RecipeDetailScreen({ recipe, onBack, availableProducts = [], onAddMissingToShoppingList, darkMode = false }: RecipeDetailScreenProps) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [detailedRecipe, setDetailedRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [translatedSteps, setTranslatedSteps] = useState<string[]>([]);
  const [translatedIngredients, setTranslatedIngredients] = useState<Array<{item: string, quantity: string}>>([]);
  const [translating, setTranslating] = useState(false);
  const [useAutoTranslation, setUseAutoTranslation] = useState(true); // Toggle pour activer/désactiver traduction auto

  // Charger les détails de la recette si c'est une recette de l'API
  useEffect(() => {
    const loadRecipeDetails = async () => {
      // Si la recette a déjà des étapes, pas besoin de charger
      if (recipe.steps && recipe.steps.length > 0) {
        return;
      }

      // Ne charger que si c'est une recette Spoonacular (ID numérique)
      // Les recettes françaises (fr-*) et TheMealDB (mealdb-*) ont déjà leurs données
      if (isNaN(parseInt(recipe.id)) || recipe.id.startsWith('fr-') || recipe.id.startsWith('mealdb-')) {
        return;
      }

      setLoading(true);
      try {
        const details = await getRecipeDetails(parseInt(recipe.id));
        if (details) {
          setDetailedRecipe(details);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipeDetails();
  }, [recipe.id, recipe.steps]);

  // Traduction automatique des étapes et ingrédients
  useEffect(() => {
    const autoTranslate = async () => {
      // Ne traduire que pour les recettes Spoonacular (API en anglais)
      // Les recettes fr-* et mealdb-* ont déjà leurs données (fr ou en)
      if (!useAutoTranslation || recipe.id.startsWith('fr-') || recipe.id.startsWith('mealdb-')) {
        return;
      }

      // Vérifier s'il y a quelque chose à traduire
      const stepsToTranslate = detailedRecipe?.analyzedInstructions?.[0]?.steps.map(s => s.step) || recipe.steps;
      const ingredientsToTranslate = detailedRecipe?.extendedIngredients || recipe.ingredients;

      if (stepsToTranslate.length === 0 && ingredientsToTranslate.length === 0) {
        return;
      }

      setTranslating(true);
      try {
        console.log('🌍 Traduction automatique en cours...');

        // Traduire les étapes
        if (stepsToTranslate.length > 0) {
          const translated = await translateTexts(stepsToTranslate);
          setTranslatedSteps(translated);
          console.log(`✅ ${translated.length} étapes traduites`);
        }

        // Traduire les ingrédients
        if (detailedRecipe?.extendedIngredients) {
          const ingredientNames = detailedRecipe.extendedIngredients.map(ing => ing.name);
          const translatedNames = await translateTexts(ingredientNames);
          
          const translatedIngs = detailedRecipe.extendedIngredients.map((ing, idx) => ({
            item: translatedNames[idx],
            quantity: `${ing.amount} ${ing.unit}`,
          }));
          setTranslatedIngredients(translatedIngs);
          console.log(`✅ ${translatedIngs.length} ingrédients traduits`);
        } else if (ingredientsToTranslate.length > 0) {
          const ingredientNames = ingredientsToTranslate.map((ing: any) => ing.item);
          const translatedNames = await translateTexts(ingredientNames);
          
          const translatedIngs = ingredientsToTranslate.map((ing: any, idx: number) => ({
            item: translatedNames[idx],
            quantity: ing.quantity,
          }));
          setTranslatedIngredients(translatedIngs);
          console.log(`✅ ${translatedIngs.length} ingrédients traduits`);
        }

        console.log('✅ Traduction automatique terminée');
      } catch (error) {
        console.error('❌ Erreur lors de la traduction automatique:', error);
      } finally {
        setTranslating(false);
      }
    };

    autoTranslate();
  }, [detailedRecipe, recipe, useAutoTranslation]);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Normalize text for matching
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/s$/, '')
      .trim();
  };

  // Utiliser les ingrédients traduits automatiquement ou fallback sur traduction manuelle
  const ingredients = useMemo(() => {
    // Si traduction automatique disponible, l'utiliser
    if (useAutoTranslation && translatedIngredients.length > 0) {
      return translatedIngredients;
    }

    // Sinon, fallback sur traduction manuelle par dictionnaire
    if (detailedRecipe?.extendedIngredients) {
      return detailedRecipe.extendedIngredients.map(ing => ({
        item: translateIngredient(ing.name),
        quantity: translateIngredient(`${ing.amount} ${ing.unit}`),
      }));
    }
    
    // Recettes françaises ou TheMealDB : déjà formatées
    if (recipe.id.startsWith('fr-') || recipe.id.startsWith('mealdb-')) {
      return recipe.ingredients;
    }
    
    // Traduire les ingrédients de base de la recette (venant de l'API)
    return recipe.ingredients.map(ing => ({
      item: translateIngredient(ing.item),
      quantity: translateIngredient(ing.quantity),
    }));
  }, [detailedRecipe, recipe.ingredients, recipe.id, translatedIngredients, useAutoTranslation]);

  const steps = useMemo(() => {
    // Si traduction automatique disponible, l'utiliser
    if (useAutoTranslation && translatedSteps.length > 0) {
      return translatedSteps;
    }

    // Sinon, fallback sur traduction manuelle par dictionnaire
    if (detailedRecipe?.analyzedInstructions && detailedRecipe.analyzedInstructions.length > 0) {
      return detailedRecipe.analyzedInstructions[0].steps.map(s => translateStep(s.step));
    }
    
    // Recettes françaises ou TheMealDB : déjà formatées
    if (recipe.id.startsWith('fr-') || recipe.id.startsWith('mealdb-')) {
      return recipe.steps;
    }
    
    // Traduire les étapes de base de la recette (venant de l'API)
    return recipe.steps.map(step => translateStep(step));
  }, [detailedRecipe, recipe.steps, recipe.id, translatedSteps, useAutoTranslation]);

  // Check which ingredients are available
  const ingredientsWithAvailability = useMemo(() => {
    return ingredients.map((ingredient) => {
      const normalizedIngredient = normalizeText(ingredient.item);
      const isAvailable = availableProducts.some((product) => {
        const normalizedProduct = normalizeText(product.name);
        return (
          normalizedIngredient.includes(normalizedProduct) ||
          normalizedProduct.includes(normalizedIngredient) ||
          (normalizedIngredient.includes('pate') && normalizedProduct.includes('spaghetti')) ||
          (normalizedIngredient.includes('spaghetti') && normalizedProduct.includes('pate')) ||
          (normalizedIngredient.includes('viande') && normalizedProduct.includes('boeuf')) ||
          (normalizedIngredient.includes('viande') && normalizedProduct.includes('poulet'))
        );
      });
      return { ...ingredient, isAvailable };
    });
  }, [ingredients, availableProducts]);

  const missingIngredients = useMemo(() => 
    ingredientsWithAvailability.filter(i => !i.isAvailable).map(i => ({ item: i.item, quantity: i.quantity })),
    [ingredientsWithAvailability]
  );

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'Facile':
        return 'text-green-600 bg-green-50';
      case 'Moyen':
        return 'text-orange-600 bg-orange-50';
      case 'Difficile':
        return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Image */}
      <div className="relative h-64 flex-shrink-0">
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onBack}
          className={`absolute top-4 left-4 p-2 rounded-full shadow-lg transition-colors ${darkMode ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
        >
          <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm rounded-2xl p-4`}>
            <div className="flex items-start justify-between mb-2">
              <h1 className={`flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {recipe.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs ml-2 ${getDifficultyColor(
                  recipe.difficulty
                )}`}
              >
                {recipe.difficulty}
              </span>
            </div>
            <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.prepTime + recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} pers.</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                <span>{recipe.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-6">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-6 pb-4">
          {/* Bouton Ajouter les ingrédients manquants */}
          {missingIngredients.length > 0 && onAddMissingToShoppingList && (
            <button
              onClick={() => {
                onAddMissingToShoppingList(missingIngredients);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Ajouter {missingIngredients.length} ingrédient{missingIngredients.length > 1 ? 's' : ''} manquant{missingIngredients.length > 1 ? 's' : ''} à la liste
            </button>
          )}

          {/* Time Details */}
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Temps de préparation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Préparation</p>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>{recipe.prepTime} min</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cuisson</p>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>{recipe.cookTime} min</p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>
                Ingrédients
              </h2>
              {translating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
            <ul className="space-y-2">
              {ingredientsWithAvailability.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  {ingredient.isAvailable ? (
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <span className={`mt-1 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  )}
                  <div className="flex-1">
                    <span className={ingredient.isAvailable ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-gray-300' : 'text-gray-600')}>
                      {ingredient.item}
                    </span>
                    <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      - {ingredient.quantity}
                    </span>
                    {ingredient.isAvailable && (
                      <span className="ml-2 text-xs text-green-500">(en stock)</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>
                Étapes de préparation
              </h2>
              {translating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traduction...</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
              </div>
            ) : steps.length === 0 ? (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Aucune étape disponible pour cette recette.
              </p>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => toggleStep(index)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          checkedSteps.has(index)
                            ? 'bg-green-600'
                            : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                      >
                        {checkedSteps.has(index) ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <p
                        className={`flex-1 transition-opacity ${
                          checkedSteps.has(index)
                            ? 'text-gray-500 line-through'
                            : darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          {checkedSteps.size > 0 && steps.length > 0 && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-800">Progression</p>
                <p className="text-green-600">
                  {checkedSteps.size}/{steps.length} étapes
                </p>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(checkedSteps.size / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
