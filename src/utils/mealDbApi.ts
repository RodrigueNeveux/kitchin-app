/**
 * TheMealDB API - Gratuite, sans clé requise
 * Documentation: https://www.themealdb.com/api.php
 * Plus de 300 recettes disponibles
 */

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

export interface RecipeFromMealDb {
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
}

function mealToRecipe(meal: MealDbMeal): RecipeFromMealDb {
  const ingredients: { item: string; quantity: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal as any)[`strIngredient${i}`];
    const measure = (meal as any)[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ item: ing.trim(), quantity: (measure || '').trim() || 'Au goût' });
    }
  }

  const steps = meal.strInstructions
    ? meal.strInstructions
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const categoryMap: Record<string, string> = {
    Beef: 'Plat principal',
    Chicken: 'Plat principal',
    Dessert: 'Dessert',
    Lamb: 'Plat principal',
    Miscellaneous: 'Plat principal',
    Pasta: 'Plat principal',
    Pork: 'Plat principal',
    Seafood: 'Plat principal',
    Side: 'Accompagnement',
    Starter: 'Entrée',
    Vegan: 'Plat principal',
    Vegetarian: 'Plat principal',
    Breakfast: 'Petit-déjeuner',
    Goat: 'Plat principal',
  };

  const category = categoryMap[meal.strCategory] || meal.strCategory || 'Plat principal';

  return {
    id: `mealdb-${meal.idMeal}`,
    name: meal.strMeal,
    image: meal.strMealThumb || '',
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: 'Moyen',
    ingredients,
    steps,
    category,
  };
}

export async function searchMealDbRecipes(query: string, limit = 15): Promise<RecipeFromMealDb[]> {
  try {
    if (!query || query.trim().length < 2) return [];
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query.trim())}`);
    const data = await response.json();
    if (!data.meals || !Array.isArray(data.meals)) return [];
    const meals = data.meals.slice(0, limit) as MealDbMeal[];
    return meals.map(mealToRecipe);
  } catch (error) {
    console.error('TheMealDB search error:', error);
    return [];
  }
}

export async function getMealDbByIngredient(ingredient: string, limit = 10): Promise<RecipeFromMealDb[]> {
  try {
    const ing = ingredient.toLowerCase().replace(/\s+/g, '_');
    const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ing)}`);
    const data = await response.json();
    if (!data.meals || !Array.isArray(data.meals)) return [];
    const ids = data.meals.slice(0, limit).map((m: any) => m.idMeal);
    const recipes: RecipeFromMealDb[] = [];
    for (const id of ids) {
      const detail = await getMealDbById(id);
      if (detail) recipes.push(detail);
    }
    return recipes;
  } catch (error) {
    console.error('TheMealDB filter error:', error);
    return [];
  }
}

export async function getMealDbById(id: string): Promise<RecipeFromMealDb | null> {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    if (!data.meals || !data.meals[0]) return null;
    return mealToRecipe(data.meals[0] as MealDbMeal);
  } catch (error) {
    console.error('TheMealDB lookup error:', error);
    return null;
  }
}

export async function getRandomMealDbRecipes(count = 10): Promise<RecipeFromMealDb[]> {
  const recipes: RecipeFromMealDb[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data = await response.json();
      if (data.meals?.[0]) {
        const meal = data.meals[0] as MealDbMeal;
        if (!seen.has(meal.idMeal)) {
          seen.add(meal.idMeal);
          recipes.push(mealToRecipe(meal));
        }
      }
    } catch {
      break;
    }
  }
  return recipes;
}
