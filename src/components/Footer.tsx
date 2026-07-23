import { ChefHat, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        
        {/* LOGO E SOBRE */}
        <div className="footer-brand">
          <div className="brand-logo">
            <ChefHat size={32} color="#f26822" />
            <span>TudoDelícia</span>
          </div>
          <p>
            O seu portal definitivo de receitas práticas e inspiradoras para transformar a sua rotina na cozinha.
          </p>
        </div>

        {/* NAVEGAÇÃO RÁPIDA */}
        <div className="footer-links">
          <h4>Categorias</h4>
          <ul>
            <li><Link to="/">Carnes e Aves</Link></li>
            <li><Link to="/">Sobremesas</Link></li>
            <li><Link to="/">Massas e Molhos</Link></li>
            <li><Link to="/">Opções Vegetarianas</Link></li>
          </ul>
        </div>

        {/* INFORMAÇÕES TÉCNICAS */}
        <div className="footer-info">
          <h4>Tecnologias</h4>
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Desenvolvido com React, TypeScript, React Router e a API do TheMealDB.
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          Feito com <Heart size={14} color="#f26822" fill="#f26822" style={{ display: 'inline', margin: '0 4px' }} /> para o seu portfólio de desenvolvimento.
        </p>
      </div>
    </footer>
  );
}
