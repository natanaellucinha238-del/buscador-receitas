import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Recipe, MealResponse } from '../types/recipe';
import { Search, ChefHat, Heart } from 'lucide-react';
import { getFavorites } from '../utils/favorites';
import '../App.css';

const categoriesMapping = [
  { label: 'Carnes', value: 'Beef' },
  { label: 'Frango e Aves', value: 'Chicken' },
  { label: 'Sobremesas', value: 'Dessert' },
  { label: 'Massas', value: 'Pasta' },
  { label: 'Marisco e Peixe', value: 'Seafood' },
  { label: 'Vegetariano', value: 'Vegetarian' },
  { label: 'Pequeno-Almoço', value: 'Breakfast' },
  { label: 'Entradas', value: 'Starter' },
];

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showingFavorites, setShowingFavorites] = useState(false);
  
  const navigate = useNavigate();

  // Define o título da aba do navegador na Home
  useEffect(() => {
    document.title = 'TudoDelícia - As Melhores Receitas';
  }, []);

  async function loadInitialRecipes() {
    setLoading(true);
    setShowingFavorites(false);
    try {
      const initialLetters = ['b', 'c', 'm', 'd', 'p'];
      const requests = initialLetters.map((letter) =>
        api.get<MealResponse>(`/search.php?f=${letter}`)
      );
      const responses = await Promise.all(requests);
      const combinedMeals = responses.flatMap((res) => res.data.meals || []);
      const uniqueMeals = combinedMeals.filter(
        (meal, index, self) => self.findIndex((m) => m.idMeal === meal.idMeal) === index
      );
      setRecipes(uniqueMeals.sort(() => 0.5 - Math.random()));
    } catch (error) {
      console.error('Erro ao carregar receitas iniciais:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecipes(query: string) {
    if (!query.trim()) {
      loadInitialRecipes();
      return;
    }
    setLoading(true);
    setShowingFavorites(false);
    try {
      const response = await api.get<MealResponse>('/search.php', {
        params: { s: query },
      });
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialRecipes();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveCategory('');
    loadRecipes(search);
  }

  function handleCategoryClick(englishValue: string) {
    setShowingFavorites(false);
    if (activeCategory === englishValue) {
      setActiveCategory('');
      setSearch('');
      loadInitialRecipes();
    } else {
      setActiveCategory(englishValue);
      setSearch(englishValue);
      loadRecipes(englishValue);
    }
  }

  // Função para exibir apenas as receitas salvas no LocalStorage
  function handleShowFavorites() {
    setActiveCategory('');
    setSearch('');
    setShowingFavorites(true);
    const favs = getFavorites();
    setRecipes(favs);
  }

  return (
    <div>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => { setSearch(''); setActiveCategory(''); loadInitialRecipes(); }}>
          <ChefHat size={32} />
          <span>TudoDelícia</span>
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Qual receita ou ingrediente procura? (ex: Chicken, Cake)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>
        </form>
      </header>

      {/* SUBMENU DE CATEGORIAS + BOTÃO MEUS FAVORITOS */}
      <nav className="categories-bar">
        <button
          onClick={handleShowFavorites}
          className={`category-btn ${showingFavorites ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: showingFavorites ? 'var(--primary)' : 'transparent', color: showingFavorites ? '#fff' : 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <Heart size={16} fill={showingFavorites ? "#fff" : "none"} />
          Meus Favoritos
        </button>

        {categoriesMapping.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryClick(cat.value)}
            className={`category-btn ${activeCategory === cat.value ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <h2 className="section-title">
          {showingFavorites 
            ? `Minhas Receitas Favoritas (${recipes.length})`
            : activeCategory 
              ? `Receitas na categoria: ${categoriesMapping.find(c => c.value === activeCategory)?.label}`
              : search 
                ? `Resultados para "${search}"` 
                : `Destaques do Dia (${recipes.length} receitas disponíveis)`}
        </h2>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>A preparar a cozinha...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '1.2rem', color: '#888' }}>
              {showingFavorites 
                ? 'Você ainda não favoritou nenhuma receita. Clique no coração de qualquer receita para salvá-la aqui!' 
                : 'Não encontrámos nenhuma receita. Tente usar termos em inglês (ex: Tomato, Pasta).'}
            </p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div 
                key={recipe.idMeal} 
                onClick={() => navigate(`/receita/${recipe.idMeal}`)}
                className="recipe-card"
              >
                <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.strMeal}</h3>
                  <div className="recipe-meta">
                    <span style={{ color: 'var(--primary)' }}>
                      {categoriesMapping.find(c => c.value === recipe.strCategory)?.label || recipe.strCategory}
                    </span>
                    <span>🌍 {recipe.strArea}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
