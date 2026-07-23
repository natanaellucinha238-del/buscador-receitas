export interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  // O TheMealDB retorna os ingredientes numerados de 1 a 20 dinamicamente
  [key: string]: string | null; 
}

export interface MealResponse {
  meals: Recipe[] | null;
}
