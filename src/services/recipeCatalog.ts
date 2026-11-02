import { api } from './api';
import { parseMealResponse, parseMealSummaryResponse } from './mealParser';
import type { Recipe, RecipeSummary } from '../types/recipe';

export type CatalogRequest =
  | { kind: 'featured' }
  | { kind: 'name'; value: string }
  | { kind: 'ingredient'; value: string }
  | { kind: 'category'; value: string };

const FEATURED_LETTERS = ['b', 'c', 'm', 'd', 'p'] as const;
const REQUEST_TIMEOUT_MS = 12000;

export function dedupeRecipes<T extends RecipeSummary>(recipes: T[]): T[] {
  const ids = new Set<string>();
  return recipes.filter((recipe) => {
    if (ids.has(recipe.idMeal)) return false;
    ids.add(recipe.idMeal);
    return true;
  });
}

async function requestFull(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<Recipe[]> {
  const response = await api.get<unknown>(path, {
    params,
    signal,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return parseMealResponse(response.data);
}

async function requestSummary(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<RecipeSummary[]> {
  const response = await api.get<unknown>('/filter.php', {
    params,
    signal,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return parseMealSummaryResponse(response.data);
}

/** Fetches the correct TheMealDB endpoint for each type of exploration. */
export async function fetchCatalog(
  request: CatalogRequest,
  signal?: AbortSignal,
): Promise<RecipeSummary[]> {
  if (request.kind === 'name') {
    return requestFull('/search.php', { s: request.value.trim() }, signal);
  }

  if (request.kind === 'ingredient') {
    return requestSummary({ i: request.value.trim() }, signal);
  }

  if (request.kind === 'category') {
    return requestSummary({ c: request.value }, signal);
  }

  // Featured: one unavailable letter should not erase all successful results.
  const results = await Promise.allSettled(
    FEATURED_LETTERS.map((letter) => requestFull('/search.php', { f: letter }, signal)),
  );
  if (signal?.aborted) throw new Error('Requisição cancelada');

  const successful = results.filter(
    (result): result is PromiseFulfilledResult<Recipe[]> => result.status === 'fulfilled',
  );
  if (successful.length === 0) {
    const firstFailure = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    throw firstFailure?.reason ?? new Error('Não foi possível carregar receitas');
  }
  return dedupeRecipes(successful.flatMap((result) => result.value));
}

export async function fetchRecipeById(
  id: string,
  signal?: AbortSignal,
): Promise<Recipe | null> {
  const recipes = await requestFull('/lookup.php', { i: id }, signal);
  return recipes[0] ?? null;
}

export async function fetchRandomRecipe(signal?: AbortSignal): Promise<Recipe | null> {
  const recipes = await requestFull('/random.php', {}, signal);
  return recipes[0] ?? null;
}
