# Biblioteca do Amanhã — Documentação do Projeto

> Uma visão completa de como o projeto foi construído, por que cada parte existe e como tudo se conecta.

---

## O que é este projeto

A **Biblioteca do Amanhã** é uma aplicação web de biblioteca pessoal compartilhada entre duas pessoas — Gianny e Laisa. O objetivo é ter um lugar centralizado para catalogar livros, registrar leituras, ler EPUBs diretamente no browser, buscar informações de livros em fontes externas e manter dados sincronizados entre as duas usuárias em tempo real.

O projeto foi construído com uma restrição importante em mente: **custo zero em produção**. Toda a infraestrutura foi escolhida para funcionar dentro dos planos gratuitos de serviços cloud (Firebase Spark, Supabase Free, Vercel Hobby), o que influenciou várias decisões de arquitetura.

---

## A arquitetura geral

O app é dividido em três camadas distintas:

**1. Frontend estático** — páginas HTML com React e Tailwind CSS, sem framework pesado. Roda no browser, pode ser hospedado em qualquer CDN ou GitHub Pages.

**2. APIs serverless na Vercel** — funções Node.js para operações que não podem (ou não devem) acontecer no browser: buscar imagens de sites externos, chamar APIs com chaves secretas.

**3. Backend Firebase** — autenticação de usuárias, banco de dados Firestore para os dados dos livros, e uma Cloud Function que bloqueia tentativas de acesso de e-mails não autorizados.

Além disso, o Supabase é usado como armazenamento de arquivos para os EPUBs — um serviço separado escolhido especificamente porque o Firebase Storage não está disponível no plano gratuito Spark.

---

## As páginas do frontend

### `index.html` — A biblioteca em si

Esta é a página principal e mais complexa do projeto. Ela contém toda a interface da biblioteca: a navegação por gêneros, as capas dos livros, os status de leitura (lendo, lido, quero ler), o sistema de curadoria e as funcionalidades de adição e edição de livros.

Uma escolha de design que merece explicação: o React é carregado via CDN (`unpkg.com`), e o JSX é transpilado no browser pelo Babel Standalone. Isso elimina a necessidade de um processo de build para a página principal, tornando o deploy tão simples quanto hospedar um arquivo HTML estático. A desvantagem é o tempo de carregamento inicial um pouco mais longo, mas para uma biblioteca pessoal com duas usuárias, essa troca vale a simplicidade.

O Firebase também é importado via CDN usando ES modules nativos do browser, o que significa que a página não tem nenhuma dependência de Node.js para funcionar.

A conexão com o Supabase (para os EPUBs) e a configuração do proxy de capas também ficam neste arquivo, nos blocos `<script>` do cabeçalho.

### `login.html` — Controle de acesso

Antes de chegar à biblioteca, a usuária passa pela tela de login. Esta página é propositalmente simples: um formulário de e-mail e senha com visual escuro e elegante (fundo navy com gradiente teal), que usa o Firebase Authentication para autenticar.

A separação entre login e biblioteca é uma decisão de segurança. O código da biblioteca — que inclui as configurações do Firestore, do Supabase e do proxy de capas — só é carregado após a autenticação ser confirmada. Isso evita que qualquer pessoa não autenticada sequer tenha acesso ao código que lista os dados.

### `book-search.html` — Adicionar livros com inteligência

Esta página resolve um problema prático: como adicionar livros à biblioteca sem ter que digitar título, autor, sinopse, gênero e tags manualmente para cada um?

O fluxo funciona assim: a usuária digita um título ou autor, o app consulta a API pública do Open Library, exibe os resultados encontrados, e ao clicar em um resultado o app envia os dados básicos para o endpoint `/api/book-profile` da Vercel. Esse endpoint enriquece os dados consultando Wikipedia, Google Books e Open Library em paralelo, depois passa tudo para uma IA (Claude ou GPT-4o-mini) que gera uma sinopse bonita em português, classifica o gênero, e cria tags de tropos como "enemies to lovers", "slow burn" ou "narrador não confiável". O resultado volta para o browser já pronto para ser salvo na biblioteca.

### `epub-viewer.html` — Leitor de livros

Permite abrir e ler arquivos EPUB diretamente no browser, sem precisar de um app externo. O leitor usa a biblioteca JSZip para descompactar o arquivo (um EPUB é essencialmente um ZIP com arquivos HTML dentro), extrair os capítulos e renderizá-los na tela. O usuário pode navegar entre capítulos, alterar a fonte e ajustar o tamanho do texto.

Os EPUBs não ficam no computador da usuária — eles são baixados do Supabase Storage quando a página abre, o que significa que qualquer uma das duas pode ler qualquer livro de qualquer dispositivo.

### `dark.html` — Experimento de dark mode

Esta é uma versão alternativa do `index.html` com o atributo `class="dark"` ativado por padrão no `<html>`. Funcionalmente idêntica à página principal, mas com paleta de cores invertida usando o sistema dark mode do Tailwind.

Este arquivo existiu como exploração de design, mas o projeto tomou a decisão de forçar sempre o modo claro no `index.html` (evidenciado pelo commit `fix: index.html sempre força light mode`). O `dark.html` permanece no repositório como artefato dessa fase de exploração, mas não está no caminho principal do app.

### `index melhorias.html` — Rascunho de desenvolvimento

Este arquivo existe para ter um espaço seguro para testar alterações no `index.html` sem quebrar a versão que está em produção. Ao terminar o desenvolvimento de uma nova funcionalidade neste rascunho, as mudanças são copiadas para o `index.html` oficial. Está listado no `.gitignore` e nunca vai para o repositório nem para produção.

---

## As APIs serverless

Esses três arquivos ficam dentro da pasta `api/` e são implantados automaticamente na Vercel como **serverless functions** — funções Node.js que respondem a requisições HTTP, mas que não rodam em um servidor dedicado. A Vercel as executa sob demanda e as "dorme" quando não há requisições, o que as mantém dentro do plano gratuito.

### `api/cover.js` — O proxy de capas

Este é provavelmente o arquivo mais importante da camada de API, e ele resolve um problema fundamental do browser.

Quando o app precisa mostrar a capa de um livro, a fonte ideal são o Goodreads e o Skoob — os maiores catálogos de livros em inglês e português, respectivamente. O problema é que esses sites **não permitem que páginas de outros domínios façam requisições diretas a eles** (isso se chama CORS — Cross-Origin Resource Sharing). Se o browser tentasse buscar uma capa do Goodreads diretamente, o site bloquearia a requisição.

A solução é usar um servidor como intermediário. O browser faz uma requisição para `/api/cover?source=goodreads&title=...&author=...`, a função na Vercel recebe esse pedido, faz ela mesma a requisição ao Goodreads (um servidor pode fazer isso sem restrições de CORS), pega a imagem de capa e a retorna como resposta. O browser nunca se comunica diretamente com o Goodreads.

A função também tem uma lógica inteligente de seleção de imagem: ela filtra URLs que claramente não são capas (sprites, ícones, logos, banners) e prefere URLs cujo path contém palavras como `cover`, `capa`, `book` ou `gr-assets`. Tenta primeiro a API de autocomplete do Goodreads (que retorna JSON limpo), e só faz scraping do HTML como fallback.

As respostas são cacheadas por 24 horas no browser (`Cache-Control: public, max-age=86400`), o que reduz o número de requisições repetidas à Vercel e mantém o consumo dentro do plano gratuito.

### `api/claude-enrich.js` — Enriquecimento leve com IA

Este endpoint recebe dados básicos de um livro (título, autor, sinopse bruta, categorias) e os envia para a API do Claude com um prompt específico. O Claude então devolve um JSON com sinopse polida em português, gênero classificado dentro das opções permitidas, tags de tropos, informação sobre série e volume, e editora brasileira quando disponível.

A razão de isso rodar na Vercel em vez de no browser é simples: a **chave da API do Anthropic nunca pode aparecer no código do frontend**. Se a chave estivesse no HTML, qualquer pessoa que abrisse o código-fonte do browser poderia vê-la e usá-la para fazer requisições às custas do dono da conta. A Vercel mantém a chave como uma variável de ambiente segura, inacessível ao browser.

### `api/book-profile.js` — Enriquecimento completo com múltiplas fontes

Este é o endpoint mais sofisticado. Ele resolve o mesmo problema do `claude-enrich.js`, mas de forma mais completa. A diferença principal é que ele não depende apenas dos dados que o browser envia — ele **busca evidências adicionais da web por conta própria** antes de chamar a IA.

Quando recebe uma requisição, ele dispara três consultas em paralelo:
- **Wikipedia** (versão em português): busca um resumo sobre o livro
- **Google Books**: busca metadados, categorias e descrição
- **Open Library**: busca subjects (temas catalogados), editoras e a primeira frase do livro

Toda essa evidência é consolidada e enviada junto ao prompt para a IA, que tem muito mais contexto para gerar uma sinopse e classificação de qualidade. O endpoint também tem uma lógica própria de detecção de tropos baseada em regex sobre os textos coletados — então mesmo sem IA, ele já consegue inferir tags como "mistério investigativo" ou "slow burn" a partir das palavras encontradas nas fontes.

O endpoint suporta tanto Claude (Anthropic) quanto GPT-4o-mini (OpenAI) — usa whichever API key estiver configurada nas variáveis de ambiente da Vercel, com preferência para o Claude.

---

## O servidor local de desenvolvimento

### `cover-proxy-server.mjs`

Durante o desenvolvimento, a Vercel não está disponível — o código está sendo editado localmente. Para que o sistema de capas funcione nesse ambiente, este servidor Node.js replica exatamente a lógica do `api/cover.js`, mas roda localmente na porta 8787 com o comando `npm run cover-proxy`.

O frontend detecta automaticamente quando está sendo executado em localhost e aponta as requisições de capa para `http://localhost:8787/cover` em vez de para a Vercel. Isso torna o desenvolvimento independente de qualquer deploy.

---

## O Firebase e sua configuração

### `firebase.json` e `.firebaserc`

Estes dois arquivos trabalham juntos para o Firebase CLI saber o que configurar e onde. O `.firebaserc` é simples: ele mapeia o alias `default` para o projeto `biblioteca-do-amanha` no Firebase, então todos os comandos `firebase deploy` sabem para qual conta e projeto enviar. O `firebase.json` descreve o que existe no projeto: as regras do Firestore e as Cloud Functions.

### `firestore.rules` — As regras de acesso ao banco

O Firestore não tem "usuário admin" e "usuário comum" por padrão — as regras são declaradas explicitamente e aplicadas automaticamente a cada leitura e escrita. Estas regras definem um comportamento específico para a dinâmica das duas usuárias:

Para os dados pessoais de cada uma (estante, livros, configurações), **qualquer uma das duas pode ler os dados da outra** — afinal, faz parte da proposta ver o que a amiga está lendo — mas **só a dona dos dados pode alterá-los**. Isso impede que uma modifique acidentalmente a estante da outra.

Para dados compartilhados (chat, comentários, notificações), **ambas têm acesso de leitura e escrita**, já que esses dados pertencem às duas igualmente.

Uma terceira camada de segurança existe nas próprias regras: elas verificam que o e-mail da sessão autenticada está na lista de e-mails autorizados. Mesmo que alguém conseguisse uma conta Firebase válida por algum meio, não conseguiria ler ou escrever dados se o e-mail não for `giannydornelas@gmail.com` ou `laisamgb@gmail.com`.

### `firebase-config.js`

Este arquivo é um template de documentação — ele mostra a estrutura de configuração do Firebase com valores placeholder para quem quiser configurar o projeto do zero em um Firebase próprio. As configurações reais de produção vivem diretamente no `index.html`, não neste arquivo.

### `functions/index.js` — A Cloud Function de bloqueio

Esta é a camada de segurança mais profunda do projeto. Ela usa o trigger `beforeUserSignedIn` do Firebase — uma função que é executada **antes** do login ser concluído, a cada tentativa de autenticação.

Se o e-mail da pessoa que está tentando entrar não constar na lista de permitidos, a Cloud Function lança um erro de `permission-denied` que o Firebase Auth usa para bloquear o login imediatamente, antes mesmo de qualquer token de sessão ser emitido.

A combinação das três camadas de segurança — regras do Firestore, verificação de e-mail nas regras, e bloqueio via Cloud Function — cria uma defesa em profundidade: mesmo que uma camada falhe, as outras continuam protegendo os dados.

### `functions/package.json` e `functions/.eslintrc.js`

As Cloud Functions do Firebase rodam em um ambiente Node.js isolado, separado do frontend. Por isso precisam do próprio `package.json` com as dependências específicas do servidor (`firebase-functions`, `firebase-admin`). O `.eslintrc.js` configura regras de análise estática de código que o Firebase CLI executa automaticamente antes de cada deploy (definido como `predeploy` no `firebase.json`) — se houver erros de lint, o deploy é bloqueado.

---

## A Vercel e sua configuração

### `vercel.json`

As serverless functions da Vercel têm um timeout padrão que pode ser muito curto para operações que dependem de APIs externas. O `book-profile.js`, por exemplo, faz três requisições em paralelo a Wikipedia, Google Books e Open Library, depois chama a API de IA — esse fluxo pode facilmente levar mais de 10 segundos em dias de latência alta. O `vercel.json` aumenta o timeout para 30 segundos nesses endpoints que precisam de mais tempo, e para 20 segundos no proxy de capas.

### `.vercel/project.json`

Gerado automaticamente pela Vercel CLI no primeiro deploy, este arquivo vincula o diretório local ao projeto `biblioteca-do-amanha-capas` na nuvem. Sem ele, o CLI perguntaria a cada deploy qual projeto usar. Está no `.gitignore` porque contém IDs específicos da conta e não deve ser versionado.

---

## O sistema de build

### `vite.config.js`

O Vite é um bundler de frontend moderno. Neste projeto ele é usado especificamente para gerar o build de produção — a pasta `dist/` com versões otimizadas das páginas.

A configuração define os cinco pontos de entrada do build: `index.html`, `login.html`, `book-search.html`, `dark.html` e `epub-viewer.html`. Cada um vira um HTML independente na pasta `dist/`, com seus assets JavaScript minificados e agrupados na subpasta `dist/assets/`.

Vale notar que o `index.html` em produção carrega React e Firebase via CDN, então o Vite faz relativamente pouco trabalho nele — o processamento principal é nas outras páginas que têm mais JavaScript local.

### `package.json`

Centraliza os scripts do projeto:
- `npm run dev` inicia o servidor de desenvolvimento do Vite com hot reload
- `npm run build` gera o build de produção em `dist/`
- `npm run preview` serve o build gerado localmente para revisão antes do deploy
- `npm run cover-proxy` inicia o servidor local de proxy de capas

As dependências instaladas (`lucide-react`, `motion`, `next`) existem no `node_modules` mas nem todas são usadas ativamente nas páginas principais — algumas podem ter sido instaladas durante exploração de ideias.

---

## Controle de versão e arquivos ignorados

### `.gitignore`

Define o que não deve entrar no repositório:

- **`node_modules/`** — as dependências pesam centenas de megabytes e qualquer um pode regenerá-las com `npm install`
- **`dist/`** — o build gerado automaticamente; não faz sentido versionar código gerado
- **`.vercel/`** — contém IDs de conta específicos do desenvolvedor
- **`.vscode/`** — configurações pessoais do editor, que variam por pessoa
- **`tmp_*.jpg`** — imagens temporárias usadas em testes locais
- **`*.log`** — arquivos de log gerados durante desenvolvimento e deploy
- **`index melhorias.html`** — o rascunho de desenvolvimento
- **`.claude/` e `skills-lock.json`** — configurações do assistente de IA usado durante o desenvolvimento

---

## Como tudo se conecta

Quando uma usuária abre o app pela primeira vez, o browser carrega o `login.html`, que autentica via Firebase Auth. A Cloud Function em `functions/index.js` intercepta o login e verifica se o e-mail está autorizado. Após autenticação bem-sucedida, o browser é redirecionado para o `index.html`.

O `index.html` então conecta ao Firestore para carregar os dados da biblioteca e ao Supabase para ter acesso aos EPUBs. Quando exibe um livro, tenta buscar a capa chamando o endpoint `/api/cover` na Vercel, que por sua vez consulta Goodreads ou Skoob e retorna a imagem.

Quando a usuária quer adicionar um novo livro, ela vai para o `book-search.html`, pesquisa o título e o app chama `/api/book-profile` (ou `/api/claude-enrich`) na Vercel, que consulta Wikipedia, Google Books e Open Library, chama a IA, e devolve um perfil completo do livro. A usuária confirma os dados e eles são salvos no Firestore.

Para ler um EPUB, o `epub-viewer.html` baixa o arquivo do Supabase Storage, descompacta com JSZip no browser e renderiza o conteúdo HTML de cada capítulo diretamente na página.

```
Browser
  │
  ├─ login.html ──────────── Firebase Auth ◄── Cloud Function (bloqueio de e-mail)
  │
  ├─ index.html ──────────── Firestore (dados da biblioteca)
  │      └─ capas ─────────── /api/cover (Vercel) ──► Goodreads / Skoob
  │      └─ EPUBs ─────────── Supabase Storage
  │
  ├─ book-search.html
  │      └─ busca ─────────── Open Library API (pública)
  │      └─ enriquecimento ── /api/book-profile (Vercel) ──► Wikipedia + Google Books + IA
  │
  └─ epub-viewer.html ─────── Supabase Storage (download EPUB) ──► JSZip (parser no browser)
```

---

## Por que cada serviço foi escolhido

| Serviço | Papel | Por que este |
|---|---|---|
| **Firebase Auth** | Autenticação | Gratuito, seguro, integra com Firestore |
| **Firestore** | Banco de dados | Tempo real, sincroniza entre duas usuárias automaticamente, plano Spark é gratuito |
| **Supabase** | Armazenamento de EPUBs | Firebase Storage não está no plano gratuito; Supabase tem 1GB grátis |
| **Vercel** | APIs serverless | Deploy automático a partir do repositório, plano Hobby gratuito com timeout razoável |
| **Open Library** | Busca de livros | API pública, sem chave necessária |
| **Wikipedia / Google Books** | Enriquecimento de dados | APIs públicas ou com quotas generosas |
| **Goodreads / Skoob** | Capas dos livros | Maior cobertura de capas em inglês e português, respectivamente |
| **Claude / GPT-4o-mini** | Processamento de linguagem | Geração de sinopses e classificação de gênero com qualidade |

---

*Documentação gerada em 2026-04-07*
