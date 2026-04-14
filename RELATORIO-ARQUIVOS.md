# Relatório de Arquivos — Biblioteca do Amanhã

> Documento explicando a finalidade de cada arquivo do repositório, por que foi criado e qual papel desempenha no projeto.

---

## O que é este projeto?

**Biblioteca do Amanhã** é uma aplicação web de biblioteca pessoal compartilhada entre duas usuárias (Gianny e Laisa). Permite catalogar livros, ler EPUBs, buscar informações de livros via APIs externas e armazenar dados em nuvem — tudo de graça, usando Firebase, Supabase e Vercel.

---

## Páginas HTML (Frontend)

### `index.html`
**O quê:** Página principal da biblioteca. É a tela central do app.

**Para que serve:** Exibe a estante de livros, gêneros, capas, status de leitura e funcionalidades de curadoria. Integra Firebase Auth (login), Firestore (banco de dados) e Supabase (armazenamento de EPUBs). Usa React via CDN (sem bundler) e Tailwind CSS para estilização.

**Por que foi criado:** É o coração do app — a tela que as usuárias veem ao fazer login. Toda a lógica de exibição, adição e edição de livros vive aqui.

---

### `login.html`
**O quê:** Tela de autenticação do app.

**Para que serve:** Apresenta o formulário de e-mail e senha com visual estilizado (fundo navy escuro com gradiente teal). Ao autenticar com sucesso via Firebase Auth, redireciona para `index.html`. Também oferece recuperação de senha.

**Por que foi criado:** Separar o fluxo de login da tela principal mantém a segurança — usuários não autenticados não chegam a carregar a biblioteca.

---

### `book-search.html`
**O quê:** Ferramenta de busca e enriquecimento de livros.

**Para que serve:** Permite pesquisar livros via Open Library API, classificá-los por gênero automaticamente com palavras-chave, e enriquecer os dados usando Claude AI (via endpoint `/api/claude-enrich`). Exibe resultados com capa, sinopse, autor e gênero detectado.

**Por que foi criado:** Facilitar a adição de novos livros à biblioteca com dados já preenchidos, sem precisar digitar tudo manualmente.

---

### `epub-viewer.html`
**O quê:** Leitor de arquivos EPUB integrado ao app.

**Para que serve:** Abre e renderiza arquivos EPUB diretamente no navegador usando a biblioteca JSZip para descompactar o arquivo e exibir os capítulos. Permite navegar pelos capítulos, configurar fonte e tema visual. Os EPUBs ficam armazenados no Supabase.

**Por que foi criado:** Permitir leitura dos livros dentro da própria biblioteca, sem depender de apps externos.

---

### `dark.html`
**O quê:** Versão alternativa (dark mode) da página principal.

**Para que serve:** Variante da `index.html` com o tema escuro ativado por padrão (`class="dark"`). Funcionalidade idêntica, mas com paleta de cores invertida.

**Por que foi criado:** Experimento de dark mode que eventualmente foi descartado em favor de forçar sempre o light mode no `index.html` principal (conforme o commit mais recente do histórico git).

---

### `index melhorias.html`
**O quê:** Rascunho de melhorias para o `index.html`.

**Para que serve:** Arquivo de trabalho para testar alterações antes de aplicá-las ao arquivo principal. Não é deployado.

**Por que foi criado:** Servir de área de testes — está listado no `.gitignore` e nunca vai para produção.

---

## APIs Serverless (pasta `api/`)

Essas funções rodam na **Vercel** como serverless functions. Cada arquivo em `api/` vira automaticamente um endpoint HTTP.

---

### `api/cover.js`
**O quê:** Proxy de capas de livros.

**Para que serve:** Recebe uma requisição com `title`, `author` e `source` (Goodreads ou Skoob), busca a imagem da capa nesses sites e a retorna diretamente como imagem binária para o browser.

**Por que foi criado:** Navegadores bloqueiam requests diretos a sites externos por CORS. Este proxy roda no servidor da Vercel, faz o fetch sem restrições e entrega a imagem para o frontend. Evita expor a lógica de scraping no browser.

**Detalhes técnicos:**
- Filtra URLs de imagens que claramente não são capas (sprites, ícones, logos)
- Adiciona cabeçalhos CORS restritos, permitindo apenas domínios autorizados do projeto
- Cache de 24h (`Cache-Control: public, max-age=86400`)

---

### `api/claude-enrich.js`
**O quê:** Endpoint de enriquecimento de dados de livros via Claude AI.

**Para que serve:** Recebe dados básicos de um livro (título, autor, sinopse curta) e chama a API do Claude (Anthropic) no servidor para gerar: sinopse elaborada, classificação de gênero, tags e outras informações enriquecidas.

**Por que foi criado:** A chave da API Anthropic (`ANTHROPIC_API_KEY`) não pode ser exposta no browser. Este endpoint a lê de uma variável de ambiente segura na Vercel e a usa server-side, mantendo o segredo protegido.

---

### `api/book-profile.js`
**O quê:** Endpoint de perfil detalhado de livros via Wikipedia.

**Para que serve:** Recebe título e autor de um livro, busca informações complementares na API da Wikipedia (resumo, categorias) e retorna um perfil enriquecido do livro. Também classifica o gênero baseado em uma lista predefinida de gêneros permitidos.

**Por que foi criado:** Complementar os dados vindos do `book-search.html` com informações da Wikipedia, que tem uma API pública sem necessidade de chave. Rodando server-side evita problemas de CORS.

---

## Servidor Local de Desenvolvimento

### `cover-proxy-server.mjs`
**O quê:** Versão local do proxy de capas para desenvolvimento.

**Para que serve:** Equivalente ao `api/cover.js`, mas roda localmente via Node.js HTTP server na porta 8787. Usado com `npm run cover-proxy` para testar o proxy de capas sem fazer deploy na Vercel.

**Por que foi criado:** Durante o desenvolvimento, a Vercel não está disponível. Este servidor permite testar a funcionalidade de capas localmente antes de subir para produção.

---

## Configuração Firebase

### `firebase.json`
**O quê:** Arquivo de configuração do Firebase CLI.

**Para que serve:** Diz ao Firebase CLI quais recursos configurar. No caso deste projeto: as regras do Firestore (`firestore.rules`) e as Cloud Functions (`functions/`). É usado quando se roda `firebase deploy`.

**Por que foi criado:** Obrigatório para usar o Firebase CLI. Sem ele, não é possível fazer deploy das regras e functions pelo terminal.

---

### `.firebaserc`
**O quê:** Arquivo que vincula o projeto local ao projeto Firebase na nuvem.

**Para que serve:** Mapeia o alias `default` para o projeto `biblioteca-do-amanha` no Firebase. Assim o CLI sabe para qual projeto enviar o deploy sem precisar especificar toda vez.

**Por que foi criado:** Criado automaticamente ao rodar `firebase init` e selecionar o projeto. Necessário para que todos os comandos do CLI apontem para o projeto correto.

---

### `firestore.rules`
**O quê:** Regras de segurança do banco de dados Firestore.

**Para que serve:** Define quem pode ler e escrever o quê no banco. As regras atuais:
- **Dados pessoais** (`/users/{userId}/...`): qualquer uma das duas usuárias pode **ler** dados de qualquer perfil (para visitar a estante da outra), mas só a **dona** dos dados pode **escrever**.
- **Dados compartilhados** (`/shared/biblioteca-do-amanha/...`): ambas as usuárias autorizadas podem ler e escrever (chat, comentários, notificações).

**Por que foi criado:** Sem regras, o Firestore fica aberto ou totalmente fechado. Estas regras criam um sistema personalizado onde as duas amigas compartilham a biblioteca com privacidade controlada.

---

### `firebase-config.js`
**O quê:** Template de configuração Firebase para novos desenvolvedores.

**Para que serve:** Arquivo de exemplo mostrando a estrutura de configuração do Firebase com valores placeholder. As configurações reais ficam diretamente no `index.html`.

**Por que foi criado:** Documentação — serve de guia para quem for configurar o projeto do zero em outro Firebase project.

---

## Cloud Functions Firebase (pasta `functions/`)

### `functions/index.js`
**O quê:** Cloud Function de controle de acesso ao Firebase Auth.

**Para que serve:** Usa o trigger `beforeUserSignedIn` do Firebase para interceptar cada tentativa de login. Se o e-mail não estiver na lista de permitidos (`giannydornelas@gmail.com` e `laisamgb@gmail.com`), o login é bloqueado com erro de "permissão negada".

**Por que foi criado:** Impedir que qualquer pessoa com um e-mail válido consiga criar conta e acessar a biblioteca. É uma camada extra de segurança além das regras do Firestore — o bloqueio acontece antes mesmo de o usuário entrar.

---

### `functions/package.json`
**O quê:** Manifesto de dependências das Cloud Functions.

**Para que serve:** Lista as dependências Node.js necessárias para as functions rodarem no Firebase (principalmente `firebase-functions` e `firebase-admin`). Separado do `package.json` raiz porque as functions rodam num ambiente Node diferente do frontend.

**Por que foi criado:** O Firebase exige um `package.json` separado na pasta `functions/` para saber quais pacotes instalar no servidor.

---

### `functions/.eslintrc.js`
**O quê:** Configuração do ESLint para as Cloud Functions.

**Para que serve:** Define regras de linting (análise estática de código) para os arquivos dentro de `functions/`. O `firebase.json` roda o lint automaticamente antes de cada deploy (`predeploy`).

**Por que foi criado:** Exigido pelo Firebase CLI no processo de deploy para garantir que o código não tem erros óbvios antes de ir para produção.

---

## Configuração Vercel

### `vercel.json`
**O quê:** Configuração de deploy na Vercel.

**Para que serve:** Define configurações para as serverless functions em `api/`. Atualmente especifica tempo máximo de execução:
- `api/book-profile.js` e `api/claude-enrich.js`: 30 segundos (chamadas a APIs externas podem demorar)
- `api/cover.js`: 20 segundos

**Por que foi criado:** As funções que chamam APIs externas (Wikipedia, Anthropic, Goodreads) podem levar vários segundos. O timeout padrão da Vercel é curto demais — este arquivo aumenta o limite para evitar erros de timeout em produção.

---

### `.vercel/project.json`
**O quê:** Metadados internos do projeto Vercel.

**Para que serve:** Vincula o diretório local ao projeto na Vercel (armazena `projectId` e `orgId`). Criado automaticamente pela Vercel CLI ao fazer o primeiro deploy.

**Por que foi criado:** Gerado automaticamente pelo comando `vercel` ou `vercel deploy`. Permite que deploys subsequentes saibam para qual projeto enviar sem precisar perguntar.

---

## Build e Bundler

### `vite.config.js`
**O quê:** Configuração do Vite (bundler de frontend).

**Para que serve:** Define os múltiplos pontos de entrada do build:
- `index.html` → página principal
- `login.html` → página de login
- `book-search.html` → busca de livros
- `dark.html` → versão dark
- `epub-viewer.html` → leitor EPUB

Quando roda `npm run build`, o Vite processa todos esses arquivos e os coloca na pasta `dist/`.

**Por que foi criado:** Necessário para fazer build de produção com múltiplas páginas. Sem este arquivo, o Vite só processaria um único ponto de entrada.

---

### `package.json`
**O quê:** Manifesto do projeto Node.js (raiz).

**Para que serve:** Define nome, versão e scripts do projeto:
- `npm run dev` → inicia servidor de desenvolvimento Vite
- `npm run build` → gera build de produção em `dist/`
- `npm run preview` → pré-visualiza o build
- `npm run cover-proxy` → inicia o servidor proxy local de capas

Também lista as dependências (`vite`, `lucide-react`, `motion`, `next`).

**Por que foi criado:** Arquivo obrigatório em qualquer projeto Node.js. Centraliza os comandos e dependências do projeto.

---

### `package-lock.json`
**O quê:** Lock file de versões exatas das dependências.

**Para que serve:** Garante que todos que instalarem o projeto (`npm install`) obtenham exatamente as mesmas versões de cada pacote. Evita o problema de "funciona na minha máquina".

**Por que foi criado:** Gerado automaticamente pelo npm ao instalar dependências. Nunca deve ser editado manualmente.

---

## Pasta `dist/`

### `dist/` (pasta inteira)
**O quê:** Output do build de produção gerado pelo Vite.

**Para que serve:** Contém as versões otimizadas e minificadas de todos os HTMLs e assets JavaScript. É esta pasta que vai para o servidor de produção (GitHub Pages, Firebase Hosting, etc.).

**Por que foi criado:** Gerado automaticamente por `npm run build`. Está no `.gitignore` porque não deve ser versionado — é sempre regenerado a partir do código-fonte.

---

## Arquivos de Controle e Configuração

### `.gitignore`
**O quê:** Lista de arquivos e pastas que o Git deve ignorar.

**Para que serve:** Impede que os seguintes itens entrem no repositório:
- `node_modules/` — dependências (pesadas demais, qualquer um pode reinstalar)
- `dist/` — build gerado automaticamente
- `.vercel/` — metadados locais da Vercel
- `.vscode/` — configurações pessoais do editor
- `tmp_*.jpg` — imagens temporárias de teste
- `*.log` — logs de debug
- `index melhorias.html` — rascunho de desenvolvimento
- `.claude/` e `skills-lock.json` — configurações do Claude Code

**Por que foi criado:** Manter o repositório limpo, sem arquivos desnecessários ou sensíveis. Boa prática obrigatória em qualquer projeto.

---

### `README-FIREBASE.md`
**O quê:** Guia de deploy para infraestrutura gratuita.

**Para que serve:** Documenta o "cenário recomendado" de hospedagem totalmente gratuita:
- **GitHub Pages** → frontend
- **Firebase** → auth e banco de dados
- **Supabase** → armazenamento de EPUBs
- **Vercel** → API de capas

Inclui checklist passo a passo de configuração.

**Por que foi criado:** Documentar como replicar toda a infraestrutura do zero sem custo. Serve como guia de referência para o deploy.

---

## Arquivos Temporários / Auxiliares

### `tmp_goodreads.jpg`
**O quê:** Imagem temporária de teste.

**Para que serve:** Provavelmente usada para testar o sistema de capas durante o desenvolvimento.

**Por que foi criado:** Gerado durante testes locais. Está coberto pelo padrão `tmp_*.jpg` no `.gitignore`, então não deveria entrar no repositório.

---

## Diagrama de Fluxo

```
Browser (usuária)
    │
    ├── login.html ──────────────── Firebase Auth (bloqueio via functions/)
    │
    ├── index.html ──────────────── Firestore (dados dos livros)
    │       └── capas ───────────── /api/cover (Vercel) ──→ Goodreads / Skoob
    │       └── EPUBs ───────────── Supabase Storage
    │
    ├── book-search.html ─────────── Open Library API (busca)
    │       └── enriquecimento ───── /api/claude-enrich (Vercel) ──→ Claude AI
    │       └── perfil ───────────── /api/book-profile (Vercel) ──→ Wikipedia
    │
    └── epub-viewer.html ─────────── Supabase Storage (download EPUB)
```

---

*Gerado em 2026-04-07*
