import { describe, expect, it } from 'vitest';
import { parseMealResponse, parseMealSummaryResponse } from './mealParser';
import type { Recipe } from '../types/recipe';

const receita: Recipe = {
  idMeal: '52772',
  strMeal: 'Frango Assado',
  strCategory: 'Chicken',
  strArea: 'Brazilian',
  strInstructions: 'Asse o frango.',
  strMealThumb: 'https://example.com/frango.jpg',
  strYoutube: '',
};

const invalid = 'Resposta inválida da TheMealDB';

describe('Validação da resposta TheMealDB (search/lookup)', () => {
  it('retorna lista vazia quando meals é null', () => {
    expect(parseMealResponse({ meals: null })).toEqual([]);
  });

  it('retorna uma lista vazia quando meals é []', () => {
    expect(parseMealResponse({ meals: [] })).toEqual([]);
  });

  it('retorna receitas quando a resposta é válida', () => {
    expect(parseMealResponse({ meals: [receita] })).toEqual([receita]);
  });

  it('rejeita meals como objeto em vez de array', () => {
    expect(() => parseMealResponse({ meals: { idMeal: '52772' } })).toThrow(invalid);
  });

  it('rejeita elementos inválidos no array', () => {
    expect(() => parseMealResponse({ meals: [receita, null, 42] })).toThrow(invalid);
  });

  it('rejeita o nome obrigatório nulo', () => {
    expect(() => parseMealResponse({ meals: [{ ...receita, strMeal: null }] }))
      .toThrow(invalid);
  });

  it('rejeita resposta sem meals', () => {
    expect(() => parseMealResponse({})).toThrow(invalid);
  });

  it('rejeita resposta nula', () => {
    expect(() => parseMealResponse(null)).toThrow(invalid);
  });

  it('rejeita valores inesperados em campos dinâmicos', () => {
    expect(() => parseMealResponse({ meals: [{ ...receita, strIngredient1: 12 }] }))
      .toThrow(invalid);
  });

  it('normaliza campos opcionais nulos sem perder a receita', () => {
    const [normalizada] = parseMealResponse({
      meals: [{ ...receita, strYoutube: null, strArea: null, strIngredient1: null }],
    });
    expect(normalizada.strYoutube).toBe('');
    expect(normalizada.strArea).toBe('');
    expect(normalizada.strIngredient1).toBeNull();
  });

  it('normaliza campos opcionais ausentes', () => {
    const [normalizada] = parseMealResponse({
      meals: [{ idMeal: '1', strMeal: 'Teste', strMealThumb: 'https://img.test/x.jpg' }],
    });
    expect(normalizada).toMatchObject({
      strCategory: '', strArea: '', strInstructions: '', strYoutube: '',
    });
  });

  it('rejeita idMeal em branco', () => {
    expect(() => parseMealResponse({ meals: [{ ...receita, idMeal: '   ' }] }))
      .toThrow(invalid);
  });
});

describe('Validação de listagem resumida (filter.php)', () => {
  const resumo = {
    idMeal: '52772',
    strMeal: 'Frango Assado',
    strMealThumb: 'https://example.com/frango.jpg',
  };

  it('aceita um resultado resumido de categoria', () => {
    expect(parseMealSummaryResponse({ meals: [resumo] })).toEqual([resumo]);
  });

  it('aceita ausência de resultados', () => {
    expect(parseMealSummaryResponse({ meals: null })).toEqual([]);
  });

  it('rejeita resposta com item sem idMeal', () => {
    expect(() => parseMealSummaryResponse({ meals: [{ strMeal: 'Frango' }] }))
      .toThrow(invalid);
  });

  it('rejeita envelope malformado', () => {
    expect(() => parseMealSummaryResponse({ meals: 'frango' })).toThrow(invalid);
  });
});
