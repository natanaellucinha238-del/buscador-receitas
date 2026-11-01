
/**
 * @vitest-environment jsdom
 */

import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  getFavorites,
  isFavorite,
  toggleFavorite,
} from './favorites';

import type { Recipe } from '../types/recipe';

const FAVORITES_KEY = '@TudoDelicia:favorites';

const receita: Recipe = {
  idMeal: '123',
  strMeal: 'Frango com Batatas',
  strCategory: 'Chicken',
  strArea: 'Brazilian',
  strInstructions: 'Prepare e asse.',
  strMealThumb: 'https://example.com/frango.jpg',
  strYoutube: '',
};

beforeEach(() => {
  localStorage.clear();
});

describe('Sistema de Favoritos', () => {

  it('retorna uma lista vazia inicialmente', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('adiciona uma receita aos favoritos', () => {
    expect(toggleFavorite(receita)).toBe(true);
    expect(getFavorites()).toEqual([receita]);
  });

  it('identifica uma receita favoritada', () => {
    toggleFavorite(receita);

    expect(isFavorite('123')).toBe(true);
    expect(isFavorite('999')).toBe(false);
  });

  it('remove uma receita já favoritada', () => {
    toggleFavorite(receita);

    expect(toggleFavorite(receita)).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('mantém os favoritos entre leituras', () => {
    toggleFavorite(receita);

    const favoritos = getFavorites();

    expect(favoritos).toHaveLength(1);
    expect(favoritos[0].idMeal).toBe('123');
  });

  it('não quebra quando o JSON é inválido', () => {
    localStorage.setItem(
      FAVORITES_KEY,
      '{json-invalido'
    );

    expect(getFavorites()).toEqual([]);
  });

  it('retorna lista vazia quando o JSON é um objeto', () => {
    localStorage.setItem(
      FAVORITES_KEY,
      '{"nome":"Receitas"}'
    );

    expect(getFavorites()).toEqual([]);
  });

  it('ignora elementos inválidos dos favoritos', () => {
    const dados = [
      receita,
      null,
      42,
      { nome: 'Receita incompleta' },
    ];

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(dados)
    );

    expect(getFavorites()).toEqual([receita]);
  });

  it('retorna lista vazia quando todos os itens são inválidos', () => {
    const dados = [
      null,
      123,
      { idMeal: '456' },
    ];

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(dados)
    );

    expect(getFavorites()).toEqual([]);
  });

});
