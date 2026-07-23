import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Recipe as RecipeType, MealResponse } from '../types/recipe';
import { ChefHat, Share2, MonitorPlay, ArrowLeft, Clock, Users, Heart } from 'lucide-react';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import '../App.css';

export default function Recipe() {
  const { id } = useParams();
  
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await api.get<MealResponse>('/lookup.php', {
          params: { i: id },
        });
        if (response.data.meals) {
          const currentRecipe = response.data.meals[0];
          setRecipe(currentRecipe);
          setFavorited(isFavorite(currentRecipe.idMeal));
          
          // Atualiza o título da aba do navegador dinamicamente
          document.title = `${currentRecipe.strMeal} - TudoDelícia`;
        }
      } catch (error) {
        console.error('Erro ao buscar os detalhes da receita:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  function handleToggleFavorite() {
    if (!recipe) return;
    const isNowFavorite = toggleFavorite(recipe);
    setFavorited(isNowFavorite);
  }

  function handleShareRecipe() {
    if (!recipe) return;
    const shareText = `Olha esta receita incrível de ${recipe.strMeal} no TudoDelícia!\nVeja o passo a passo aqui: ${window.location.href}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function getIngredients() {
    if (!recipe) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
      }
    }
    return ingredients;
  }

  function getYouTubeEmbedUrl() {
    if (!recipe?.strYoutube || recipe.strYoutube.trim() === '') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = recipe.strYoutube.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
        <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>A preparar os ingredientes...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Receita não encontrada!</h2>
        <Link to="/" style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  const prepTime = (recipe.idMeal.charCodeAt(0) % 40) + 20;
  const portions = (recipe.idMeal.charCodeAt(1) % 8) + 2;
  const favoritesCount = (recipe.idMeal.charCodeAt(2) * 14) + (favorited ? 1 : 0);

  return (
    <div style={{ backgroundColor: '#eef1f4', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* NAVBAR */}
      <header className="navbar" style={{ justifyContent: 'center', position: 'relative' }}>
        <Link to="/" style={{ position: 'absolute', left: '5%', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
          <ArrowLeft size={24} /> Voltar
        </Link>
        <div className="nav-brand">
          <ChefHat size={32} />
          <span>TudoDelícia</span>
        </div>
      </header>

      {/* CONTAINER DA RECEITA */}
      <main style={{ maxWidth: '1100px', margin: '40px auto 0', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        {/* CABEÇALHO DA RECEITA */}
        <div style={{ padding: '40px 50px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '2.8rem', color: 'var(--text-dark)', fontWeight: '800' }}>
              {recipe.strMeal}
            </h1>
            
            {/* BOTÕES DE AÇÃO: FAVORITAR E COMPARTILHAR */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleToggleFavorite} 
                style={{ backgroundColor: favorited ? '#ffe6e6' : '#f5f5f5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                title={favorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              >
                <Heart size={24} color={favorited ? "#f26822" : "#555"} fill={favorited ? "#f26822" : "none"} />
              </button>
              
              <button 
                onClick={handleShareRecipe} 
                style={{ backgroundColor: '#f5f5f5', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                title="Partilhar Link da Receita"
              >
                <Share2 size={24} color={copied ? "#1e8e3e" : "#555"} />
              </button>
            </div>
          </div>

          {copied && (
            <div style={{ backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '12px 20px', borderRadius: '6px', marginBottom: '25px', fontWeight: 'bold', display: 'inline-block' }}>
              Link copiado com sucesso! ✅
            </div>
          )}

          {/* ESTATÍSTICAS */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <Clock size={32} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Preparo</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>{prepTime} MIN</span>
            </div>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <Users size={32} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Rendimento</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>{portions} PORÇÕES</span>
            </div>
            <div style={{ flex: '1', minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: favorited ? '#ffe6e6' : '#f9f9f9', padding: '20px', borderRadius: '8px', transition: 'background 0.3s' }}>
              <Heart size={32} color="var(--primary)" fill={favorited ? "var(--primary)" : "none"} />
              <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Favoritos</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>{favoritesCount.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* CORPO DA RECEITA */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          
          {/* COLUNA ESQUERDA: IMAGEM E VÍDEO */}
          <div style={{ flex: '1 1 450px', padding: '40px 50px' }}>
            <img 
              src={recipe.strMealThumb} 
              alt={recipe.strMeal} 
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', objectFit: 'cover' }} 
            />
            
            {getYouTubeEmbedUrl() && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <MonitorPlay size={28} color="var(--primary)" /> Assista ao Vídeo
                </h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#000', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={getYouTubeEmbedUrl() as string}
                    title="Vídeo da receita"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: INGREDIENTES E PREPARO */}
          <div style={{ flex: '1 1 450px', padding: '40px 50px', backgroundColor: '#fafafa', borderLeft: '1px solid #eee' }}>
            
            <section style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', borderBottom: '4px solid var(--primary)', paddingBottom: '10px', display: 'inline-block' }}>
                Ingredientes
              </h2>
              <ul style={{ paddingLeft: '20px', marginTop: '25px', lineHeight: '2.2' }}>
                {getIngredients().map((ingredient, index) => (
                  <li key={index} style={{ color: '#444', fontSize: '1.1rem', borderBottom: '1px dashed #ddd', paddingBottom: '8px', marginBottom: '8px' }}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', borderBottom: '4px solid var(--primary)', paddingBottom: '10px', display: 'inline-block' }}>
                Modo de Preparo
              </h2>
              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', marginTop: '25px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p style={{ lineHeight: '2', whiteSpace: 'pre-wrap', color: '#444', fontSize: '1.1rem', margin: 0 }}>
                  {recipe.strInstructions}
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
