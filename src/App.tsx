import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Footer from './components/Footer';
import './App.css';

export function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Conteúdo principal com flex: 1 para empurrar o Footer para o rodapé da página */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/receita/:id" element={<Recipe />} />
          </Routes>
        </div>
        
        {/* Rodapé visível em todas as rotas */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

