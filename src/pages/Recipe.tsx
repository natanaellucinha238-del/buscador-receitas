import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChefHat, Share2, MonitorPlay, ArrowLeft, Globe2, UtensilsCrossed, Heart } from 'lucide-react';
import { api } from '../services/api';
import { parseMealResponse } from '../services/mealParser';
import type { Recipe as RecipeType } from '../types/recipe';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import '../App.css';

function getYouTubeEmbedUrl(source: string): string | null {
  if (!source.trim()) return null;

  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    const host = url.hostname.toLowerCase();
    let id: string | null = null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.split('/')[1] ?? null;
    } else if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'www.youtube-nocookie.com'
    ) {
      id = url.pathname === '/watch'
        ? url.searchParams.get('v')
        : (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null);
    } else {
      return null;
    }

    return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? `https://www.youtube.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

export default function Recipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadRecipe() {
      document.title = 'Receita - TudoDelícia';
      setLoading(true);
      setError(null);
      setRecipe(null);
      setFavorited(false);

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<unknown>('/lookup.php', {
          params: { i: id },
          signal: controller.signal,
        });
        const meals = parseMealResponse(response.data);
        if (cancelled) return;

        const foundRecipe = meals[0] ?? null;
        setRecipe(foundRecipe);
        if (foundRecipe) {
          setFavorited(isFavorite(foundRecipe.idMeal));
          document.title = `${foundRecipe.strMeal} - TudoDelícia`;
        }
      } catch (cause) {
        if (cancelled) return;
        console.error('Erro ao buscar detalhes da receita:', cause);
        setError('Não foi possível carregar esta receita. Verifique sua conexão e tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecipe();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  useEffect(() => () => {
    if (copyTimer.current !== null) clearTimeout(copyTimer.current);
  }, []);

  function handleToggleFavorite() {
    if (!recipe) return;
    setFavorited(toggleFavorite(recipe));
  }

  async function handleShareRecipe() {
    if (!recipe) return;
    const shareText = `Olha esta receita incrível de ${recipe.strMeal} no TudoDelícia!\nVeja aqui: ${window.location.href}`;
    setShareError(false);
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch (cause) {
      console.error('Falha ao copiar o link:', cause);
      setCopied(false);
      setShareError(true);
    }
  }

  function getIngredients(current: RecipeType): string[] {
    const ingredients: string[] = [];
    for (let index = 1; index <= 20; index += 1) {
      const ingredient = current[`strIngredient${index}`];
      const measure = current[`strMeasure${index}`];
      if (ingredient?.trim()) {
        ingredients.push(`${measure?.trim() ?? ''} ${ingredient.trim()}`.trim());
      }
    }
    return ingredients;
  }

  if (loading) {
    return (
      <main role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#f9f9f9' }}>
        <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          A preparar os ingredientes...
        </p>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main role={error ? 'alert' : undefined} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>
          {error ? 'Erro ao carregar receita' : 'Receita não encontrada!'}
        </h2>
        {error && <p>{error}</p>}
        <Link to="/" style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Voltar para a Página Inicial
        </Link>
      </main>
    );
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(recipe.strYoutube);
  const ingredients = getIngredients(recipe);

  return (
    <div style={{ backgroundColor: '#eef1f4', minHeight: '100vh', paddingBottom: '60px' }}>
      <header className="navbar" style={{ justifyContent: 'center', position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', left: '5%', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <ArrowLeft size={24} /> Voltar
        </Link>
        <div className="nav-brand">
          <ChefHat size={32} />
          <span>TudoDelícia</span>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '40px auto 0', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '40px 50px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '2.8rem', color: 'var(--text-dark)', fontWeight: '800' }}>
              {recipe.strMeal}
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label={favorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                aria-pressed={favorited}
                style={{ backgroundColor: favorited ? '#ffe6e6' : '#f5f5f5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={favorited ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              >
                <Heart size={24} color={favorited ? '#f26822' : '#555'} fill={favorited ? '#f26822' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => { void handleShareRecipe(); }}
                aria-label="Copiar link da receita"
                title="Compartilhar link da receita"
                style={{ backgroundColor: '#f5f5f5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Share2 size={24} color={copied ? '#1e8e3e' : '#555'} />
              </button>
            </div>
          </div>

          {copied && (
            <p role="status" style={{ color: '#1e8e3e', fontWeight: 'bold' }}>
              Link copiado com sucesso!
            </p>
          )}
          {shareError && (
            <p role="alert" style={{ color: '#a22', fontWeight: 'bold' }}>
              Não foi possível copiar o link. Copie o endereço diretamente da barra do navegador.
            </p>
          )}

          {/* Apenas informações reais ou status local; sem números fictícios. */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <Globe2 size={32} color="var(--primary)" />
              <span style={{ color: '#888', fontWeight: 'bold' }}>Origem</span>
              <strong>{recipe.strArea || 'Não informada'}</strong>
            </div>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <UtensilsCrossed size={32} color="var(--primary)" />
              <span style={{ color: '#888', fontWeight: 'bold' }}>Categoria</span>
              <strong>{recipe.strCategory || 'Não informada'}</strong>
            </div>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: favorited ? '#ffe6e6' : '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <Heart size={32} color="var(--primary)" fill={favorited ? 'var(--primary)' : 'none'} />
              <span style={{ color: '#888', fontWeight: 'bold' }}>Favoritos</span>
              <strong>{favorited ? 'Salva' : 'Não salva'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 450px', padding: '40px 50px' }}>
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', objectFit: 'cover' }}
            />
            {youtubeEmbedUrl && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <MonitorPlay size={28} color="var(--primary)" /> Assista ao vídeo
                </h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#000' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={youtubeEmbedUrl}
                    title={`Vídeo da receita ${recipe.strMeal}`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 450px', padding: '40px 50px', backgroundColor: '#fafafa', borderLeft: '1px solid #eee' }}>
            <section style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', borderBottom: '4px solid var(--primary)', paddingBottom: '10px', display: 'inline-block' }}>
                Ingredientes
              </h2>
              {ingredients.length === 0 ? (
                <p>Ingredientes não informados.</p>
              ) : (
                <ul style={{ paddingLeft: '20px', marginTop: '25px', lineHeight: '2.2' }}>
                  {ingredients.map((ingredient, index) => (
                    <li key={`${index}-${ingredient}`} style={{ color: '#444', fontSize: '1.1rem', borderBottom: '1px dashed #ddd', paddingBottom: '8px', marginBottom: '8px' }}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', borderBottom: '4px solid var(--primary)', paddingBottom: '10px', display: 'inline-block' }}>
                Modo de preparo
              </h2>
              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', marginTop: '25px', border: '1px solid #eee' }}>
                <p style={{ lineHeight: '2', whiteSpace: 'pre-wrap', color: '#444', fontSize: '1.1rem', margin: 0 }}>
                  {recipe.strInstructions || 'Modo de preparo não informado.'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
