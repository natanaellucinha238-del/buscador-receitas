import type { Recipe } from '../types/recipe';

const FAVORITES_KEY = '@TudoDelicia:favorites';

// Busca todas as receitas salvas no LocalStorage
export function getFavorites(): Recipe[] {
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
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
