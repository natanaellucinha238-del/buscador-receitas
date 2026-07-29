# 🍳 TudoDelícia — Portal de Receitas

<p align="center">
  <strong>Um portal moderno e interativo para busca, visualização e salvamento de receitas culinárias.</strong>
</p>

<p align="center">
  <a href="https://buscador-receitas-feze.vercel.app/"><strong>🌐 Acesse a Aplicação Online</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📌 Sobre o Projeto

O **TudoDelícia** é uma Single Page Application (SPA) inspirada em grandes portais de gastronomia como o *TudoGostoso*. 

A aplicação consome dados em tempo real da API pública [TheMealDB](https://www.themealdb.com/), oferecendo aos usuários uma navegação intuitiva por categorias, busca rápida de ingredientes, exibição detalhada com vídeos instrutivos e gerenciamento de receitas favoritas.

---

## ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
| :--- | :--- |
| **🔍 Busca Dinâmica** | Pesquisa instantânea por pratos ou ingredientes específicos. |
| **🏷️ Categorias Traduzidas** | Interface em Português com tradução dinâmica para requisições em Inglês na API. |
| **🎲 Destaques Iniciais** | Requisições assíncronas paralelas (`Promise.all`) para exibir múltiplos pratos ao carregar o site. |
| **📱 Páginas Dedicadas** | Rotas dinâmicas por ID (`/receita/:id`) usando `React Router DOM`. |
| **❤️ Favoritos (LocalStorage)** | Armazenamento de receitas preferidas persistido no próprio navegador. |
| **📺 Vídeos de Preparo** | Integração direta de player do YouTube quando disponível para o prato. |
| **🔗 Compartilhamento** | Copia a URL da receita para a área de transferência com um clique. |

---

## ⚡ Decisões de Arquitetura & Performance de Rede

Como desenvolvedor com bagagem em **Redes e Computadores**, priorizei a eficiência nas chamadas HTTP, resiliência do sistema e a melhor experiência para o usuário:

* **Requisições em Paralelo (`Promise.all`):** Para evitar o efeito *waterfall* (esperar uma requisição HTTP ser concluída para iniciar a próxima), as receitas de destaque na página inicial são buscadas em paralelo, reduzindo drasticamente o tempo total de carregamento.
* **Resiliência na Camada de Serviço:** Abstração de chamadas HTTP através de uma instância configurada do Axios, facilitando o tratamento centralizado de exceções de rede e timeouts.
* **Roteamento SPA e Servidor (Vercel):** Utilização do `vercel.json` para reescrita de rotas (*rewrites*), garantindo que o roteamento no cliente via React Router DOM funcione corretamente sem erros 404 em acessos diretos por URL.

---

## 🛠️ Tecnologias Utilizadas

- **Core:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router DOM](https://reactrouter.com/)
- **Consumo de API:** [Axios](https://axios-http.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Estilização:** CSS3 puro com variáveis globais, Flexbox e CSS Grid
- **Hospedagem:** [Vercel](https://vercel.com/)

---

## 📂 Estrutura do Projeto

```text
buscador-receitas/
├── public/
├── src/
│   ├── components/       # Componentes globais (ex: Footer, Navbar)
│   ├── pages/            # Páginas da aplicação (Home, Recipe)
│   ├── services/         # Configuração do Axios e chamadas à API
│   ├── types/            # Interface e tipos do TypeScript
│   ├── utils/            # Funções utilitárias e gerenciamento de LocalStorage
│   ├── App.css           # Estilos globais da aplicação
│   ├── App.tsx           # Configuração de rotas
│   └── main.tsx          # Ponto de entrada da aplicação
├── vercel.json           # Configuração de rotas para SPA na Vercel
└── README.md
