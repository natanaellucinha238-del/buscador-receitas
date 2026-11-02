import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChefHat, Heart } from 'lucide-react';
import { api } from '../services/api';
import { parseMealResponse, parseMealSummaryResponse } from '../services/mealParser';
import type { RecipeSummary } from '../types/recipe';
import { getFavorites } from '../utils/favorites';
import '../App.css';

const categoriesMapping = [
  { label: 'Carnes', value: 'Beef' },
  { label: 'Frango e Aves', value: 'Chicken' },
  { label: 'Sobremesas', value: 'Dessert' },
  { label: 'Massas', value: 'Pasta' },
  { label: 'Marisco e Peixe', value: 'Seafood' },
  { label: 'Vegetariano', value: 'Vegetarian' },
  { label: 'Café da Manhã', value: 'Breakfast' },
  { label: 'Entradas', value: 'Starter' },
];

export default function Home() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showingFavorites, setShowingFavorites] = useState(false);
  // Apenas a resposta da solicitação mais recente pode modificar a tela.
  const requestId = useRef(0);

  async function runLatest(
    loader: () => Promise<RecipeSummary[]>,
    failureMessage: string,
  ) {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    setShowingFavorites(false);

    try {
      const nextRecipes = await loader();
      if (currentRequest !== requestId.current) return;
      setRecipes(nextRecipes);
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      console.error(failureMessage, cause);
      setRecipes([]);
      setError(failureMessage);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  function loadInitialRecipes() {
    void runLatest(async () => {
      const letters = ['b', 'c', 'm', 'd', 'p'];
      const responses = await Promise.all(
        letters.map((letter) =>
          api.get<unknown>('/search.php', { params: { f: letter } }),
        ),
      );
      const allMeals = responses.flatMap((response) => parseMealResponse(response.data));
      return [...new Map(allMeals.map((meal) => [meal.idMeal, meal])).values()];
    }, 'Não foi possível carregar os destaques. Tente novamente.');
  }

  function loadRecipes(query: string) {
    const cleanedQuery = query.trim();
    if (!cleanedQuery) {
      loadInitialRecipes();
      return;
    }

    void runLatest(async () => {
      const response = await api.get<unknown>('/search.php', {
        params: { s: cleanedQuery },
      });
      return parseMealResponse(response.data);
    }, 'Não foi possível buscar receitas. Tente novamente.');
  }

  function loadCategory(category: string) {
    void runLatest(async () => {
      // filter.php retorna apenas ID, nome e foto (sem detalhes completos).
      const response = await api.get<unknown>('/filter.php', {
        params: { c: category },
      });
      return parseMealSummaryResponse(response.data);
    }, 'Não foi possível carregar esta categoria. Tente novamente.');
  }

  useEffect(() => {
    document.title = 'TudoDelícia - As Melhores Receitas';
    loadInitialRecipes();
    return () => { requestId.current += 1; };
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveCategory('');
    loadRecipes(search);
  }

  function handleCategoryClick(category: string) {
    if (activeCategory === category) {
      setActiveCategory('');
      setSearch('');
      loadInitialRecipes();
      return;
    }
    setActiveCategory(category);
    setSearch('');
    loadCategory(category);
  }

  function handleShowFavorites() {
    // Impede que a resposta de uma busca ainda pendente sobrescreva os favoritos.
    requestId.current += 1;
    setLoading(false);
    setError(null);
    setActiveCategory('');
    setSearch('');
    setShowingFavorites(true);
    setRecipes(getFavorites());
  }

  function handleGoHome() {
    setSearch('');
    setActiveCategory('');
    loadInitialRecipes();
  }

  function handleRetry() {
    if (activeCategory) {
      loadCategory(activeCategory);
    } else if (search.trim()) {
      loadRecipes(search);
    } else {
      loadInitialRecipes();
    }
  }

  return (
    <div>
      <header className="navbar">
        <button
          type="button"
          className="nav-brand"
          onClick={handleGoHome}
          style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}
          aria-label="Voltar aos destaques do TudoDelícia"
        >
          <ChefHat size={32} />
          <span>TudoDelícia</span>
        </button>

        <form onSubmit={handleSearch} className="search-form" role="search">
          <input
            type="search"
            placeholder="Qual receita procura? (ex: Chicken, Cake)"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="search-input"
            aria-label="Pesquisar receitas pelo nome"
          />
          <button type="submit" className="search-button" aria-label="Pesquisar">
            <Search size={20} />
          </button>
        </form>
      </header>

      <nav className="categories-bar" aria-label="Categorias de receitas">
        <button
          type="button"
          onClick={handleShowFavorites}
          className={`category-btn ${showingFavorites ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: showingFavorites ? 'var(--primary)' : 'transparent', color: showingFavorites ? '#fff' : 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <Heart size={16} fill={showingFavorites ? '#fff' : 'none'} />
          Meus Favoritos
        </button>
        {categoriesMapping.map((category) => (
          <button
            type="button"
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            className={`category-btn ${activeCategory === category.value ? 'active' : ''}`}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        <h2 className="section-title">
          {showingFavorites
            ? `Minhas Receitas Favoritas (${recipes.length})`
            : activeCategory
              ? `Receitas na categoria: ${categoriesMapping.find((c) => c.value === activeCategory)?.label ?? activeCategory}`
              : search
                ? `Resultados para "${search}"`
                : `Destaques do Dia (${recipes.length} receitas disponíveis)`}
        </h2>

        {loading ? (
          <div role="status" style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              A preparar a cozinha...
            </p>
          </div>
        ) : error ? (
          <div role="alert" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#a22', fontWeight: 'bold' }}>{error}</p>
            <button type="button" className="category-btn" onClick={handleRetry}>
              Tentar novamente
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '1.2rem', color: '#888' }}>
              {showingFavorites
                ? 'Você ainda não favoritou nenhuma receita. Clique no coração de uma receita para salvá-la aqui!'
                : 'Não encontramos receitas. Tente outro termo ou categoria.'}
            </p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <Link
                key={recipe.idMeal}
                to={`/receita/${recipe.idMeal}`}
                className="recipe-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" loading="lazy" />
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.strMeal}</h3>
                  <div className="recipe-meta">
                    {recipe.strCategory && (
                      <span style={{ color: 'var(--primary)' }}>
                        {categoriesMapping.find((c) => c.value === recipe.strCategory)?.label ?? recipe.strCategory}
                      </span>
                    )}
                    {recipe.strArea && <span>🌍 {recipe.strArea}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
