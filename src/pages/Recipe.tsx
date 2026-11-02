import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, ChefHat, ClipboardCheck, Globe2, Heart,
  MonitorPlay, Share2, UtensilsCrossed,
} from 'lucide-react';
import { fetchCatalog, fetchRecipeById } from '../services/recipeCatalog';
import type { Recipe as RecipeType, RecipeSummary } from '../types/recipe';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import '../styles/experience.css';

function getYouTubeEmbedUrl(source: string): string | null {
  if (!source.trim()) return null;
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    let id: string | null = null;
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.split('/')[1] ?? null;
    } else if (
      host === 'youtube.com' || host === 'www.youtube.com' ||
      host === 'm.youtube.com' || host === 'www.youtube-nocookie.com'
    ) {
      id = url.pathname === '/watch'
        ? url.searchParams.get('v')
        : (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null);
    } else {
      return null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

function ingredientsOf(recipe: RecipeType): string[] {
  const items: string[] = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = recipe[`strIngredient${index}`];
    const measure = recipe[`strMeasure${index}`];
    if (ingredient?.trim()) {
      items.push(`${measure?.trim() ?? ''} ${ingredient.trim()}`.trim());
    }
  }
  return items;
}

function preparationSections(instructions: string): string[] {
  return instructions
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((section) => section.trim())
    .filter(Boolean);
}

export default function Recipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [related, setRelated] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    document.title = 'Receita | TudoDelícia';
    setLoading(true);
    setRecipe(null);
    setRelated([]);
    setError(null);
    setChecked(new Set());
    setCopied(false);

    async function load() {
      if (!id) {
        if (active) setLoading(false);
        return;
      }
      try {
        const found = await fetchRecipeById(id, controller.signal);
        if (!active) return;
        setRecipe(found);
        if (found) {
          setFavorited(isFavorite(found.idMeal));
          document.title = `${found.strMeal} | TudoDelícia`;
          if (found.strCategory) {
            void fetchCatalog({ kind: 'category', value: found.strCategory }, controller.signal)
              .then((results) => {
                if (active) setRelated(results.filter((item) => item.idMeal !== found.idMeal).slice(0, 4));
              })
              .catch(() => { /* Sugestões são opcionais; a receita continua disponível. */ });
          }
        }
      } catch (cause) {
        if (!active || controller.signal.aborted) return;
        console.error('Falha ao carregar receita:', cause);
        setError('Não foi possível carregar esta receita. Verifique a conexão e tente novamente.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, retryKey]);

  useEffect(() => () => {
    if (copyTimer.current !== null) clearTimeout(copyTimer.current);
  }, []);

  async function handleShare() {
    if (!recipe) return;
    setShareError(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch (cause) {
      console.error('Falha ao copiar endereço:', cause);
      setShareError(true);
    }
  }

  function handleFavorite() {
    if (!recipe) return;
    setFavorited(toggleFavorite(recipe));
  }

  function toggleIngredient(index: number) {
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (loading) {
    return (
      <main className="td-app td-detail-status" role="status" aria-live="polite">
        <span className="td-loader" aria-hidden="true" />
        <p>Preparando os ingredientes...</p>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="td-app td-detail-status" role={error ? 'alert' : undefined}>
        <div className="td-empty__icon"><UtensilsCrossed size={32} /></div>
        <h1>{error ? 'Não foi possível carregar' : 'Receita não encontrada'}</h1>
        <p>{error ?? 'Essa receita não está disponível no momento.'}</p>
        <div className="td-detail-status__actions">
          {error && <button className="td-outline-button" type="button" onClick={() => setRetryKey((key) => key + 1)}>Tentar novamente</button>}
          <Link className="td-primary-button" to="/">Voltar às receitas <ArrowRight size={17} /></Link>
        </div>
      </main>
    );
  }

  const ingredients = ingredientsOf(recipe);
  const sections = preparationSections(recipe.strInstructions);
  const embed = getYouTubeEmbedUrl(recipe.strYoutube);
  const progress = ingredients.length > 0 ? Math.round((checked.size / ingredients.length) * 100) : 0;

  return (
    <div className="td-app td-detail-page">
      <a className="td-skip-link" href="#modo-preparo">Pular para o preparo</a>
      <header className="td-header">
        <div className="td-container td-header__inner">
          <Link className="td-brand" to="/"><span className="td-brand__icon"><ChefHat size={24} /></span><span>Tudo<span className="td-brand__accent">Delícia</span></span></Link>
          <Link to="/" className="td-back"><ArrowLeft size={18} /> Todas as receitas</Link>
        </div>
      </header>

      <main className="td-container td-detail">
        <nav className="td-breadcrumb" aria-label="Localização"><Link to="/">Início</Link><span aria-hidden="true">/</span><span>Detalhes da receita</span></nav>
        <section className="td-detail__heading">
          <div>
            <span className="td-kicker"><UtensilsCrossed size={15} /> Hora de cozinhar</span>
            <h1>{recipe.strMeal}</h1>
            <div className="td-detail__tags">
              {recipe.strCategory && <span><UtensilsCrossed size={15} /> {recipe.strCategory}</span>}
              {recipe.strArea && <span><Globe2 size={15} /> {recipe.strArea}</span>}
            </div>
          </div>
          <div className="td-detail__actions">
            <button className={`td-detail__action ${favorited ? 'is-saved' : ''}`} type="button" aria-pressed={favorited} onClick={handleFavorite}>
              <Heart size={19} fill={favorited ? 'currentColor' : 'none'} />{favorited ? 'Salva' : 'Salvar receita'}
            </button>
            <button className="td-detail__action" type="button" onClick={() => { void handleShare(); }}>
              {copied ? <Check size={19} /> : <Share2 size={19} />}{copied ? 'Link copiado' : 'Compartilhar'}
            </button>
          </div>
        </section>
        {shareError && <p role="alert" className="td-inline-error">Não foi possível copiar o link. Você pode copiar o endereço diretamente do navegador.</p>}

        <div className="td-detail__cover">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <div className="td-detail__cover-note"><ChefHat size={19} /> Prepare no seu ritmo, do seu jeito.</div>
        </div>

        <div className="td-detail__columns">
          <aside className="td-ingredients" aria-labelledby="ingredientes">
            <div className="td-ingredients__header">
              <span className="td-overline">Checklist da cozinha</span>
              <h2 id="ingredientes">Ingredientes</h2>
              <p>Marque o que já separou para o preparo.</p>
            </div>
            {ingredients.length > 0 ? (
              <>
                <div className="td-progress__row"><span>{checked.size} de {ingredients.length} separados</span><strong>{progress}%</strong></div>
                <div className="td-progress" role="progressbar" aria-label="Ingredientes separados" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
                <ul className="td-ingredient-list">
                  {ingredients.map((ingredient, index) => (
                    <li key={`${index}-${ingredient}`}>
                      <label className={checked.has(index) ? 'is-checked' : ''}>
                        <input type="checkbox" checked={checked.has(index)} onChange={() => toggleIngredient(index)} />
                        <span className="td-checkbox" aria-hidden="true"><Check size={13} /></span>
                        <span>{ingredient}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : <p>Ingredientes não informados.</p>}
          </aside>

          <div className="td-preparation" id="modo-preparo">
            <section aria-labelledby="preparo-titulo">
              <span className="td-overline">Mãos à obra</span>
              <h2 id="preparo-titulo">Modo de preparo</h2>
              {sections.length > 0 ? (
                <div className="td-preparation__steps">
                  {sections.map((text, index) => (
                    <div className="td-preparation__step" key={`${index}-${text.slice(0, 20)}`}>
                      <span className="td-preparation__number">{String(index + 1).padStart(2, '0')}</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              ) : <p>Modo de preparo não informado.</p>}
            </section>
            {embed && (
              <section className="td-video" aria-labelledby="td-video-title">
                <h2 id="td-video-title"><MonitorPlay size={24} /> Assista ao preparo</h2>
                <p>Vídeo relacionado à receita, quando disponibilizado pela TheMealDB.</p>
                <div className="td-video__frame">
                  <iframe src={embed} loading="lazy" title={`Vídeo de preparo: ${recipe.strMeal}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="td-related" aria-labelledby="td-related-heading">
            <div className="td-section-heading"><div><span className="td-overline">Continue explorando</span><h2 id="td-related-heading">Outras receitas para experimentar</h2></div></div>
            <div className="td-grid">
              {related.map((item) => (
                <article className="td-card" key={item.idMeal}>
                  <Link className="td-card__link" to={`/receita/${item.idMeal}`}>
                    <div className="td-card__image-wrap"><img className="td-card__image" src={item.strMealThumb} alt={item.strMeal} loading="lazy" /></div>
                    <div className="td-card__content"><h3>{item.strMeal}</h3><span className="td-card__more">Ver receita <ArrowRight size={15} /></span></div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="td-footer"><div className="td-container td-footer__inner"><span><ClipboardCheck size={20} /> TudoDelícia</span><p>Receitas e vídeos provenientes da TheMealDB. Conteúdo original pode estar em inglês.</p></div></footer>
    </div>
  );
}
