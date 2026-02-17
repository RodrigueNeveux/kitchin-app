/**
 * Spoonacular API Service
 * Documentation: https://spoonacular.com/food-api/docs
 *
 * FREE: 150 requests per day
 * To get an API key:
 * 1. Go to https://spoonacular.com/food-api/console
 * 2. Create a free account
 * 3. Copy your API Key
 * 4. Replace YOUR_SPOONACULAR_API_KEY below
 */

const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || "";
const BASE_URL = "https://api.spoonacular.com";
const DEMO_MODE = !SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === "YOUR_SPOONACULAR_API_KEY";

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    name: string;
    original: string;
    image: string;
  }>;
  usedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    name: string;
    original: string;
    image: string;
  }>;
  unusedIngredients?: Array<{
    id: number;
    amount: number;
    unit: string;
    name: string;
    original: string;
    image: string;
  }>;
  likes?: number;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

export interface RecipeDetails extends SpoonacularRecipe {
  instructions?: string;
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients: Array<{
        id: number;
        name: string;
        image: string;
      }>;
      equipment: Array<{
        id: number;
        name: string;
        image: string;
      }>;
    }>;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  summary?: string;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
}

export async function findRecipesByIngredients(
  ingredients: string[],
  number: number = 20,
  ranking: 1 | 2 = 1,
): Promise<SpoonacularRecipe[]> {
  if (DEMO_MODE) return [];

  try {
    const ingredientsString = ingredients.join(",+");
    const url = `${BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsString}&number=${number}&ranking=${ranking}&ignorePantry=true`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Spoonacular API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch {
    return [];
  }
}

export async function getRecipeDetails(
  recipeId: number,
): Promise<RecipeDetails | null> {
  if (DEMO_MODE) return null;

  try {
    const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Spoonacular API Error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

export async function searchRecipes(
  query: string,
  number: number = 20,
): Promise<{
  results: SpoonacularRecipe[];
  totalResults: number;
}> {
  if (DEMO_MODE) return { results: [], totalResults: 0 };

  try {
    const url = `${BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&number=${number}&addRecipeInformation=true`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Spoonacular API Error: ${response.status}`);
    const data = await response.json();
    return {
      results: data.results || [],
      totalResults: data.totalResults || 0,
    };
  } catch {
    return { results: [], totalResults: 0 };
  }
}

export function isApiConfigured(): boolean {
  return !DEMO_MODE;
}

export function getRemainingQuota(): number {
  if (DEMO_MODE) return 150;
  return 150;
}
}