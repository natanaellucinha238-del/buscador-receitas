import type { Recipe, RecipeSummary } from '../types/recipe';

const ERROR_MESSAGE = 'Resposta inválida da TheMealDB';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Valida o envelope { meals: [...] | null } antes de acessar suas propriedades. */
function readMeals(input: unknown): unknown[] {
  if (!isRecord(input) || !Object.prototype.hasOwnProperty.call(input, 'meals')) {
    throw new Error(ERROR_MESSAGE);
  }

  const meals = input.meals;
  if (meals === null) return [];
  if (!Array.isArray(meals)) throw new Error(ERROR_MESSAGE);
  return meals;
}

/** Rejeita tipos inesperados inclusive nos campos dinâmicos. */
function hasAllowedValues(record: Record<string, unknown>): boolean {
  return Object.values(record).every(
    (value) => typeof value === 'string' || value === null,
  );
}

function normalizeRecipe(value: unknown): Recipe {
  if (!isRecord(value) || !hasAllowedValues(value)) {
    throw new Error(ERROR_MESSAGE);
  }

  if (
    !isNonEmptyString(value.idMeal) ||
    !isNonEmptyString(value.strMeal) ||
    !isNonEmptyString(value.strMealThumb)
  ) {
    throw new Error(ERROR_MESSAGE);
  }

  // Alguns campos podem ser nulos ou ausentes na resposta. Normalizamos
  // para string, garantindo compatibilidade com a UI e o módulo de favoritos.
  const normalized: Recipe = {
    ...(value as Record<string, string | null>),
    idMeal: value.idMeal,
    strMeal: value.strMeal,
    strMealThumb: value.strMealThumb,
    strCategory: typeof value.strCategory === 'string' ? value.strCategory : '',
    strArea: typeof value.strArea === 'string' ? value.strArea : '',
    strInstructions:
      typeof value.strInstructions === 'string' ? value.strInstructions : '',
    strYoutube: typeof value.strYoutube === 'string' ? value.strYoutube : '',
  };
  return normalized;
}

/** Para search.php e lookup.php: retorna receitas completas e normalizadas. */
export function parseMealResponse(input: unknown): Recipe[] {
  return readMeals(input).map(normalizeRecipe);
}

/** Para filter.php?c=: o endpoint NÃO retorna receitas completas. */
export function parseMealSummaryResponse(input: unknown): RecipeSummary[] {
  return readMeals(input).map((value): RecipeSummary => {
    if (!isRecord(value) || !hasAllowedValues(value)) {
      throw new Error(ERROR_MESSAGE);
    }
    if (
      !isNonEmptyString(value.idMeal) ||
      !isNonEmptyString(value.strMeal) ||
      !isNonEmptyString(value.strMealThumb)
    ) {
      throw new Error(ERROR_MESSAGE);
    }
    return {
      idMeal: value.idMeal,
      strMeal: value.strMeal,
      strMealThumb: value.strMealThumb,
    };
  });
}
