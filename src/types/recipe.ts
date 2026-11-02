/** Receita completa e normalizada, usada nos detalhes e favoritos. */
export interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  /** Ingredientes, medidas e outros campos dinâmicos da TheMealDB. */
  [key: string]: string | null;
}

/** Dados resumidos retornados pelo endpoint filter.php. */
export type RecipeSummary = Pick<Recipe, 'idMeal' | 'strMeal' | 'strMealThumb'> &
  Partial<Pick<Recipe, 'strCategory' | 'strArea'>>;

/** Contrato esperado após a validação (não substitui checagem em runtime). */
export interface MealResponse {
  meals: Recipe[] | null;
}
