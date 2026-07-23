import axios from 'axios';

// A URL base do TheMealDB para a versão gratuita
export const api = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
});
