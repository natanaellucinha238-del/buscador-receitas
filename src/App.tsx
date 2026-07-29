import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Footer from './components/Footer';
import './App.css';

export function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="main-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/receita/:id" element={<Recipe />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
