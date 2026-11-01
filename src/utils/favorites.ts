import type { Recipe } from '../types/recipe';

const FAVORITES_KEY = '@TudoDelicia:favorites';

// Busca todas as receitas salvas no LocalStorage



export function getFavorites(): Recipe[] {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);

    if (savedFavorites === null) {
      return [];
    }

    const parsedData: unknown = JSON.parse(savedFavorites);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(isRecipe);
  } catch {
    return [];
  }
}
const REQUIRED_RECIPE_FIELDS = [
  'idMeal',
  'strMeal',
  'strCategory',
  'strArea',
  'strInstructions',
  'strMealThumb',
  'strYoutube',
] as const;

function isRecipe(value: unknown): value is Recipe {
  // Rejeita null, arrays e valores primitivos
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  // Todos os campos obrigatórios devem ser strings
  const hasRequiredFields = REQUIRED_RECIPE_FIELDS.every(
    (field) => typeof candidate[field] === 'string'
  );

  if (!hasRequiredFields) {
    return false;
  }

  // Uma receita precisa ter um identificador não vazio
  if (
    typeof candidate.idMeal !== 'string' ||
    candidate.idMeal.trim() === ''
  ) {
    return false;
  }

  // O modelo atual permite somente strings ou null
  return Object.values(candidate).every(
    (fieldValue) =>
      typeof fieldValue === 'string' || fieldValue === null
  );
}



// Verifica se uma receita específica já está favoritada
export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.some((item) => item.idMeal === id);
}

// Adiciona ou remove a receita dos favoritos (Toggle)
export function toggleFavorite(recipe: Recipe): boolean {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.idMeal === recipe.idMeal);

  let updatedFavorites: Recipe[];

  if (exists) {
    // Se já existe, remove
    updatedFavorites = favorites.filter((item) => item.idMeal !== recipe.idMeal);
  } else {
    // Se não existe, adiciona
    updatedFavorites = [...favorites, recipe];
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  
  // Retorna true se acabou de favoritar, ou false se desfavoritou
  return !exists; 
}




