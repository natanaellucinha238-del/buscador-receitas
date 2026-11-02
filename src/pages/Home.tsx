import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, ChefHat, ChevronDown, Heart, LoaderCircle,
  Search, Shuffle, Sparkles, UtensilsCrossed, X,
} from 'lucide-react';
import { fetchCatalog, fetchRandomRecipe, fetchRecipeById, type CatalogRequest } from '../services/recipeCatalog';
import type { RecipeSummary } from '../types/recipe';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import '../styles/experience.css';

const CATEGORIES = [
  { label: 'Carnes', value: 'Beef', emoji: '🥩' },
  { label: 'Frango e aves', value: 'Chicken', emoji: '🍗' },
  { label: 'Sobremesas', value: 'Dessert', emoji: '🍰' },
  { label: 'Massas', value: 'Pasta', emoji: '🍝' },
  { label: 'Peixes e frutos do mar', value: 'Seafood', emoji: '🐟' },
  { label: 'Vegetarianas', value: 'Vegetarian', emoji: '🥗' },
  { label: 'Café da manhã', value: 'Breakfast', emoji: '☕' },
  { label: 'Entradas', value: 'Starter', emoji: '🥣' },
];

const PAGE_SIZE = 12;
type View = 'featured' | 'search' | 'category' | 'favorites';
type SearchMode = 'name' | 'ingredient';
type SortMode = 'default' | 'az' | 'za';

function categoryLabel(value: string): string {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export default function Home() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [view, setView] = useState<View>('featured');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surpriseError, setSurpriseError] = useState<string | null>(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavorites().map((r) => r.idMeal));
  const [sort, setSort] = useState<SortMode>('default');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastRequest, setLastRequest] = useState<CatalogRequest>({ kind: 'featured' });
  const requestController = useRef<AbortController | null>(null);
  const requestNumber = useRef(0);

  function cancelCatalog() {
    requestNumber.current += 1;
    requestController.current?.abort();
  }

  async function runCatalog(request: CatalogRequest) {
    cancelCatalog();
    const number = requestNumber.current;
    const controller = new AbortController();
    requestController.current = controller;
    setLastRequest(request);
    setError(null);
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    setSort('default');
    try {
      const data = await fetchCatalog(request, controller.signal);
      if (number === requestNumber.current && !controller.signal.aborted) {
        setRecipes(data);
      }
    } catch (cause) {
      if (number === requestNumber.current && !controller.signal.aborted) {
        console.error('Não foi possível carregar o catálogo:', cause);
        setRecipes([]);
        setError('Não conseguimos buscar as receitas agora. Verifique sua conexão e tente novamente.');
      }
    } finally {
      if (number === requestNumber.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    document.title = 'TudoDelícia | Descubra sua próxima receita';
    void runCatalog({ kind: 'featured' });
    return () => cancelCatalog();
  }, []);

  function showFeatured() {
    setView('featured');
    setCategory('');
    setSubmittedSearch('');
    setSearchText('');
    void runCatalog({ kind: 'featured' });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = searchText.trim();
    if (!value) {
      showFeatured();
      return;
    }
    setView('search');
    setCategory('');
    setSubmittedSearch(value);
    void runCatalog({ kind: searchMode, value });
  }

  function handleCategory(value: string) {
    if (view === 'category' && category === value) {
      showFeatured();
      return;
    }
    setView('category');
    setCategory(value);
    setSubmittedSearch('');
    setSearchText('');
    void runCatalog({ kind: 'category', value });
  }

  function handleFavorites() {
    if (view === 'favorites') {
      showFeatured();
      return;
    }
    cancelCatalog();
    setLoading(false);
    setError(null);
    setView('favorites');
    setCategory('');
    setSubmittedSearch('');
    setSearchText('');
    setVisibleCount(PAGE_SIZE);
    setSort('default');
    setRecipes(getFavorites());
  }

  async function handleSurprise() {
    if (surpriseLoading) return;
    setSurpriseError(null);
    setSurpriseLoading(true);
    try {
      const surprise = await fetchRandomRecipe();
      if (!surprise) throw new Error('Nenhuma receita encontrada');
      navigate(`/receita/${surprise.idMeal}`);
    } catch (cause) {
      console.error('Falha ao buscar receita surpresa:', cause);
      setSurpriseError('Não foi possível sortear uma receita. Tente novamente.');
    } finally {
      setSurpriseLoading(false);
    }
  }

  async function handleFavorite(recipe: RecipeSummary) {
    if (savingId !== null) return;
    setSavingId(recipe.idMeal);
    setFavoriteError(null);
    try {
      const existing = getFavorites().find((saved) => saved.idMeal === recipe.idMeal);
      const fullRecipe = existing ?? await fetchRecipeById(recipe.idMeal);
      if (!fullRecipe) throw new Error('Receita não encontrada');
      toggleFavorite(fullRecipe);
      setFavoriteIds(getFavorites().map((saved) => saved.idMeal));
      if (view === 'favorites') setRecipes(getFavorites());
    } catch (cause) {
      console.error('Falha ao atualizar os favoritos:', cause);
      setFavoriteError('Não foi possível alterar seus favoritos. Tente novamente.');
    } finally {
      setSavingId(null);
    }
  }

  const sortedRecipes = useMemo(() => {
    if (sort === 'default') return recipes;
    return [...recipes].sort((a, b) => (
      sort === 'az'
        ? a.strMeal.localeCompare(b.strMeal, 'pt-BR')
        : b.strMeal.localeCompare(a.strMeal, 'pt-BR')
    ));
  }, [recipes, sort]);
  const shownRecipes = sortedRecipes.slice(0, visibleCount);
  const canShowMore = visibleCount < sortedRecipes.length;
  const heroImage = recipes[0]?.strMealThumb;
  const sectionTitle = view === 'favorites'
    ? 'Suas receitas favoritas'
    : view === 'category'
      ? categoryLabel(category)
      : view === 'search'
        ? `Resultados para “${submittedSearch}”`
        : 'Ideias para você cozinhar hoje';

  return (
    <div className="td-app">
      <a className="td-skip-link" href="#receitas">Pular para as receitas</a>
      <header className="td-header">
        <div className="td-container td-header__inner">
          <button type="button" className="td-brand" onClick={showFeatured} aria-label="TudoDelícia, voltar ao início">
            <span className="td-brand__icon"><ChefHat size={24} /></span>
            <span>Tudo<span className="td-brand__accent">Delícia</span></span>
          </button>
          <nav className="td-header__actions" aria-label="Navegação principal">
            <a href="#categorias" className="td-header__link">Categorias</a>
            <button type="button" className={`td-header__favorite ${view === 'favorites' ? 'is-current' : ''}`} onClick={handleFavorites} aria-pressed={view === 'favorites'}>
              <Heart size={18} fill={view === 'favorites' ? 'currentColor' : 'none'} />
              <span>Favoritos</span>
              <span className="td-count">{favoriteIds.length}</span>
            </button>
          </nav>
        </div>
      </header>

      <section className="td-hero" aria-labelledby="td-hero-title">
        <div className="td-container td-hero__layout">
          <div className="td-hero__copy">
            <span className="td-kicker"><Sparkles size={15} /> Cozinhar fica mais gostoso aqui</span>
            <h1 id="td-hero-title">Uma boa receita muda <em>o seu dia.</em></h1>
            <p>Inspiração para todas as ocasiões. Pesquise pelo nome do prato, encontre receitas por ingrediente ou explore novos sabores.</p>
            <form className="td-search" onSubmit={handleSearch} role="search">
              <label className="td-sr-only" htmlFor="td-recipe-search">Buscar receitas</label>
              <Search size={21} className="td-search__icon" />
              <input
                id="td-recipe-search"
                type="search"
                value={searchText}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
                placeholder={searchMode === 'name' ? 'Ex.: chicken, pasta, cake...' : 'Ex.: chicken, cheese, tomato...'}
                autoComplete="off"
              />
              {searchText && (
                <button className="td-search__clear" type="button" onClick={() => setSearchText('')} aria-label="Limpar busca"><X size={17} /></button>
              )}
              <button className="td-search__submit" type="submit">Buscar <ArrowRight size={17} /></button>
            </form>
            <div className="td-search-options" aria-label="Tipo de busca">
              <span>Pesquisar por:</span>
              <button type="button" className={searchMode === 'name' ? 'is-active' : ''} onClick={() => setSearchMode('name')} aria-pressed={searchMode === 'name'}>Nome do prato</button>
              <button type="button" className={searchMode === 'ingredient' ? 'is-active' : ''} onClick={() => setSearchMode('ingredient')} aria-pressed={searchMode === 'ingredient'}>Ingrediente</button>
            </div>
            <div className="td-hero__footer">
              <button type="button" className="td-surprise" onClick={() => { void handleSurprise(); }} disabled={surpriseLoading}>
                {surpriseLoading ? <LoaderCircle className="td-spin" size={18} /> : <Shuffle size={18} />}
                {surpriseLoading ? 'Escolhendo uma receita...' : 'Surpreenda-me com uma receita'}
              </button>
              <span className="td-hero__hint">Receitas da TheMealDB em inglês</span>
            </div>
            {surpriseError && <p className="td-inline-error" role="alert">{surpriseError}</p>}
          </div>
          <div className="td-hero__visual" aria-hidden="true">
            {heroImage ? <img src={heroImage} alt="" /> : <span className="td-hero__emoji">🍲</span>}
            <div className="td-hero__stamp"><UtensilsCrossed size={17} /> Descubra novos sabores</div>
          </div>
        </div>
      </section>

      <section id="categorias" className="td-categories td-container" aria-labelledby="td-categories-title">
        <div className="td-section-heading td-section-heading--compact">
          <div>
            <span className="td-overline">Explore por estilo</span>
            <h2 id="td-categories-title">O que vamos cozinhar?</h2>
          </div>
          <button type="button" className={`td-reset ${view === 'featured' ? 'is-current' : ''}`} onClick={showFeatured}>Ver todas <ArrowRight size={16} /></button>
        </div>
        <div className="td-categories__list">
          {CATEGORIES.map((item) => (
            <button
              className={`td-category ${view === 'category' && category === item.value ? 'is-active' : ''}`}
              aria-pressed={view === 'category' && category === item.value}
              key={item.value}
              type="button"
              onClick={() => handleCategory(item.value)}
            >
              <span className="td-category__emoji" aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <main id="receitas" className="td-catalog td-container" tabIndex={-1}>
        <div className="td-section-heading td-section-heading--catalog">
          <div>
            <span className="td-overline">Seleção TudoDelícia</span>
            <h2>{sectionTitle}</h2>
            {!loading && !error && <p>{recipes.length} {recipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}</p>}
          </div>
          <label className="td-sort-label">
            <span>Ordenar</span>
            <select value={sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setSort(event.target.value as SortMode); setVisibleCount(PAGE_SIZE); }} disabled={loading || recipes.length === 0}>
              <option value="default">Recomendadas</option>
              <option value="az">Nome A–Z</option>
              <option value="za">Nome Z–A</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        </div>

        {favoriteError && <p role="alert" className="td-inline-error">{favoriteError}</p>}
        {loading ? (
          <div className="td-grid" role="status" aria-label="Carregando receitas">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="td-card td-card--skeleton" aria-hidden="true">
                <div className="td-skeleton td-skeleton__image" />
                <div className="td-card__content"><div className="td-skeleton td-skeleton__line" /><div className="td-skeleton td-skeleton__line td-skeleton__line--short" /></div>
              </div>
            ))}
            <span className="td-sr-only">Carregando receitas...</span>
          </div>
        ) : error ? (
          <div className="td-empty" role="alert">
            <div className="td-empty__icon"><BookOpen size={30} /></div>
            <h3>Ops, não conseguimos abrir o cardápio.</h3>
            <p>{error}</p>
            <button type="button" className="td-primary-button" onClick={() => { setError(null); void runCatalog(lastRequest); }}>Tentar novamente <ArrowRight size={17} /></button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="td-empty">
            <div className="td-empty__icon">{view === 'favorites' ? <Heart size={30} /> : <Search size={30} />}</div>
            <h3>{view === 'favorites' ? 'Sua coleção começa aqui.' : 'Nenhuma receita encontrada.'}</h3>
            <p>{view === 'favorites' ? 'Toque no coração de qualquer receita para guardá-la nos seus favoritos.' : 'Experimente outro termo em inglês ou escolha uma categoria.'}</p>
            <button type="button" className="td-primary-button" onClick={showFeatured}>Explorar receitas <ArrowRight size={17} /></button>
          </div>
        ) : (
          <>
            <div className="td-grid">
              {shownRecipes.map((recipe) => {
                const saved = favoriteIds.includes(recipe.idMeal);
                return (
                  <article className="td-card" key={recipe.idMeal}>
                    <Link className="td-card__link" to={`/receita/${recipe.idMeal}`} aria-label={`Ver receita: ${recipe.strMeal}`}>
                      <div className="td-card__image-wrap">
                        <img src={recipe.strMealThumb} alt={recipe.strMeal} loading="lazy" className="td-card__image" />
                        {recipe.strCategory && <span className="td-card__badge">{categoryLabel(recipe.strCategory)}</span>}
                      </div>
                      <div className="td-card__content">
                        <h3>{recipe.strMeal}</h3>
                        <span className="td-card__more">Ver receita <ArrowRight size={15} /></span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className={`td-card__favorite ${saved ? 'is-saved' : ''}`}
                      aria-label={saved ? `Remover ${recipe.strMeal} dos favoritos` : `Salvar ${recipe.strMeal} nos favoritos`}
                      aria-pressed={saved}
                      disabled={savingId !== null}
                      onClick={() => { void handleFavorite(recipe); }}
                    >
                      {savingId === recipe.idMeal ? <LoaderCircle className="td-spin" size={19} /> : <Heart size={19} fill={saved ? 'currentColor' : 'none'} />}
                    </button>
                  </article>
                );
              })}
            </div>
            {canShowMore && (
              <div className="td-load-more">
                <p>Mostrando {shownRecipes.length} de {recipes.length} receitas</p>
                <button type="button" className="td-outline-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  Mostrar mais receitas <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="td-footer">
        <div className="td-container td-footer__inner">
          <span><ChefHat size={20} /> TudoDelícia</span>
          <p>Feito para quem ama descobrir novos sabores. Receitas fornecidas pela TheMealDB.</p>
        </div>
      </footer>
    </div>
  );
}
