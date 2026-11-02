import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { dedupeRecipes, fetchCatalog, fetchRandomRecipe, fetchRecipeById } from './recipeCatalog';

vi.mock('./api', () => ({ api: { get: vi.fn() } }));

const meal = {
  idMeal: '52772',
  strMeal: 'Chicken soup',
  strMealThumb: 'https://example.com/chicken.jpg',
  strCategory: 'Chicken',
  strArea: 'British',
  strInstructions: 'Prepare.',
  strYoutube: '',
};
const summary = { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb };
const get = vi.mocked(api.get);

beforeEach(() => { get.mockReset(); });

describe('Catálogo TheMealDB', () => {
  it('remove duplicações pela identidade sem alterar a ordem', () => {
    expect(dedupeRecipes([summary, summary, { ...summary, idMeal: '2' }]).map((r) => r.idMeal)).toEqual(['52772', '2']);
  });

  it('busca pratos por nome usando search.php?s', async () => {
    get.mockResolvedValue({ data: { meals: [meal] } } as never);
    const result = await fetchCatalog({ kind: 'name', value: '  chicken  ' });
    expect(result).toHaveLength(1);
    expect(get).toHaveBeenCalledWith('/search.php', expect.objectContaining({ params: { s: 'chicken' } }));
  });

  it('busca por ingrediente usando filter.php?i e retorna resumos', async () => {
    get.mockResolvedValue({ data: { meals: [summary] } } as never);
    expect(await fetchCatalog({ kind: 'ingredient', value: '  cheese  ' })).toEqual([summary]);
    expect(get).toHaveBeenCalledWith('/filter.php', expect.objectContaining({ params: { i: 'cheese' } }));
  });

  it('busca por categoria usando filter.php?c', async () => {
    get.mockResolvedValue({ data: { meals: [summary] } } as never);
    expect(await fetchCatalog({ kind: 'category', value: 'Chicken' })).toEqual([summary]);
    expect(get).toHaveBeenCalledWith('/filter.php', expect.objectContaining({ params: { c: 'Chicken' } }));
  });

  it('retorna [] quando a busca não tem resultados', async () => {
    get.mockResolvedValue({ data: { meals: null } } as never);
    expect(await fetchCatalog({ kind: 'name', value: 'nada' })).toEqual([]);
  });

  it('retorna a receita completa em lookup.php', async () => {
    get.mockResolvedValue({ data: { meals: [meal] } } as never);
    expect(await fetchRecipeById(meal.idMeal)).toMatchObject(meal);
    expect(get).toHaveBeenCalledWith('/lookup.php', expect.objectContaining({ params: { i: meal.idMeal } }));
  });

  it('carrega uma receita aleatória com random.php', async () => {
    get.mockResolvedValue({ data: { meals: [meal] } } as never);
    expect(await fetchRandomRecipe()).toMatchObject(meal);
    expect(get).toHaveBeenCalledWith('/random.php', expect.objectContaining({ params: {} }));
  });

  it('mantém destaques parciais se uma das cinco buscas falha', async () => {
    get.mockRejectedValueOnce(new Error('falha na letra b'));
    get.mockResolvedValue({ data: { meals: [meal] } } as never);
    const featured = await fetchCatalog({ kind: 'featured' });
    expect(featured).toHaveLength(1);
    expect(get).toHaveBeenCalledTimes(5);
  });

  it('rejeita destaques se todas as buscas falharem', async () => {
    get.mockRejectedValue(new Error('indisponível'));
    await expect(fetchCatalog({ kind: 'featured' })).rejects.toThrow('indisponível');
  });
});
