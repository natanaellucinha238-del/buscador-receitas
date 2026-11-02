<div align="center">

# 🍽️ TudoDelícia

**Encontre receitas, descubra pratos por categoria e salve seus favoritos.**

Aplicação web desenvolvida com **React, TypeScript e Vite**, integrada à API [TheMealDB](https://www.themealdb.com/).

[![CI — Testes, build, lint e segurança](https://github.com/natanaellucinha238-del/buscador-receitas/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/natanaellucinha238-del/buscador-receitas/actions/workflows/ci.yml)

</div>

## Sobre o projeto

O **TudoDelícia** é um buscador de receitas criado para praticar desenvolvimento front-end, integração com APIs REST, tipagem com TypeScript e testes automatizados. O projeto possui pesquisa de receitas, navegação por categorias e uma área de favoritos persistidos no navegador.

O foco das últimas entregas foi a **confiabilidade**: respostas da API são validadas antes de serem utilizadas na interface, erros possuem tratamento visual e a qualidade do código é verificada por testes e integração contínua.

## Funcionalidades

- 🔎 **Pesquisa por nome** usando a TheMealDB.
- 🍲 **Destaques de receitas** carregados na página inicial.
- 🗂️ **Filtro por categorias** com o endpoint específico da API.
- 📖 **Página de detalhes** com ingredientes, instruções e vídeo do YouTube quando disponível.
- ❤️ **Favoritos persistentes** por meio de `localStorage`.
- 🔗 **Compartilhamento do link** de uma receita, quando permitido pelo navegador.
- ⚠️ **Estados de carregamento, ausência de resultados e erro**, com opção de tentar novamente quando aplicável.
- ♿ **Navegação semântica** com links, botões e rótulos acessíveis nas principais interações.

## Tecnologias

| Categoria | Tecnologias |
| --- | --- |
| Interface | React, TypeScript, CSS |
| Desenvolvimento e build | Vite, Node.js, npm |
| Navegação | React Router |
| HTTP | Axios |
| Testes | Vitest, jsdom |
| Qualidade | Oxlint, TypeScript |
| Integração contínua | GitHub Actions |
| Dados externos | TheMealDB API |

## Executando localmente

**Pré-requisitos:** Git, Node.js e npm. Recomenda-se **Node.js 24**, a versão utilizada no workflow de CI.

```bash
git clone https://github.com/natanaellucinha238-del/buscador-receitas.git
cd buscador-receitas
npm ci
npm run dev
```

Abra no navegador o endereço exibido pelo Vite (normalmente `http://localhost:5173`).

### Comandos de qualidade

```bash
npm test        # Testes automatizados
npm run build   # Verificação TypeScript + build de produção
npm run lint    # Análise estática
npm audit       # Auditoria de dependências
```

## Estrutura principal

```text
src/
├── components/         # Componentes compartilhados
├── pages/
│   ├── Home.tsx        # Busca, categorias, destaques e favoritos
│   └── Recipe.tsx      # Detalhes de uma receita
├── services/
│   ├── api.ts          # Instância do Axios
│   ├── mealParser.ts   # Validação e normalização da resposta da API
│   └── mealParser.test.ts
├── types/
│   └── recipe.ts       # Modelos das receitas
└── utils/
    ├── favorites.ts    # Persistência local
    └── favorites.test.ts

.github/workflows/ci.yml # Pipeline automatizado
```

## Validação de dados e testes

A aplicação trata os dados recebidos da API como **não confiáveis até serem validados**. O módulo `mealParser` distingue receitas completas de respostas resumidas usadas nos filtros por categoria, valida a estrutura das respostas e normaliza determinados campos opcionais.

O projeto conta com **25 testes automatizados** no estado atual desta documentação:

- **16 testes** do parser e da validação de respostas da API;
- **9 testes** do módulo de favoritos, inclusive dados inválidos no `localStorage`.

O workflow de **GitHub Actions** executa, para Pull Requests direcionados a `main` e pushes na `main`, as seguintes verificações:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. `npm run lint`
5. `npm audit`

Os testes e a auditoria ajudam a reduzir regressões e riscos conhecidos, mas não substituem testes manuais ou uma avaliação de segurança completa.

## Decisões técnicas

- **TypeScript** para explicitar contratos e evitar erros comuns durante o desenvolvimento.
- **Validação em runtime** para não depender exclusivamente da tipagem estática das respostas HTTP.
- **Separação entre transporte e apresentação**: Axios obtém os dados, o parser os valida e os componentes React renderizam o resultado.
- **Controle de requisições concorrentes** para impedir que resultados antigos substituam pesquisas mais recentes.
- **Favoritos locais** para oferecer persistência sem exigir cadastro ou backend próprio.
- **Integração contínua** para verificar automaticamente cada Pull Request.

## Limitações e próximos passos

- Os favoritos são armazenados **apenas no navegador atual**; não há sincronização entre dispositivos.
- As receitas, instruções, imagens e vídeos são fornecidos por uma **API externa**, sujeita à disponibilidade do serviço.
- A cobertura de testes ainda pode ser ampliada com testes de componentes, integração HTTP e acessibilidade.
- Planeja-se disponibilizar uma versão pública hospedada e adicionar capturas de tela reais após o deploy.

## API utilizada

Dados de receitas: [TheMealDB](https://www.themealdb.com/) — este é um projeto independente, sem afiliação oficial ao serviço.

## Autoria

Desenvolvido por **Natanael Lucas Miranda** como projeto de estudo e portfólio em desenvolvimento web.

- [GitHub](https://github.com/natanaellucinha238-del)

---

<div align="center">
  <sub>Feito para aprender, testar, melhorar e compartilhar conhecimento.</sub>
</div>
