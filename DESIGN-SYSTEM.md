# Design System — Biblioteca do Amanhã

> Referência completa de tokens, componentes e padrões visuais do projeto. Pronto para importação no Figma.

---

## 1. Cores (Color Tokens)

### Paleta Principal (Brand)

| Token | Hex | Uso |
|---|---|---|
| `--teal` | `#14B8A6` | Cor primária — CTAs, badges ativos, destaque |
| `--teal-dark` | `#0d9e8e` | Hover do botão primário |
| `--teal-glow` | `rgba(20,184,166,0.4)` | Glow/shadow teal |
| `--navy` | `#1E3A5F` | Cor secundária — títulos, botões escuros |
| `--navy-deep` | `#0F2240` | Background dark (login, modais overlay) |

### Paleta de Background e Texto

| Token | Hex/Classe Tailwind | Uso |
|---|---|---|
| `--bg` | `#F8F9FB` | Background geral da biblioteca |
| `--text-primary` | `#111827` | Texto principal (`gray-900`) |
| `--text-secondary` | `#6B7280` | Texto secundário (`gray-500`) |
| `--text-muted` | `#9CA3AF` | Texto desativado, meta-info (`gray-400`) |
| `--border` | `#E5E7EB` | Bordas default (`gray-200`) |
| `--surface` | `#FFFFFF` | Superfície de cards e modais |

### Cores por Gênero Literário

Cada gênero tem um trio de cores: `background`, `text` e `border`.

| Gênero | Background | Texto | Borda |
|---|---|---|---|
| **Fantasia** | `#ECFDF5` (emerald-50) | `#047857` (emerald-700) | `#A7F3D0` (emerald-200) |
| **Romantasy** | `#ECFEFF` (cyan-50) | `#0E7490` (cyan-700) | `#A5F3FC` (cyan-200) |
| **Ficção Científica** | `#EFF6FF` (blue-50) | `#1D4ED8` (blue-700) | `#BFDBFE` (blue-200) |
| **Thriller** | `#F0FDFA` (teal-50) | `#0F766E` (teal-700) | `#99F6E4` (teal-200) |
| **Romance Contemporâneo** | `#F0F9FF` (sky-50) | `#0369A1` (sky-700) | `#BAE6FD` (sky-200) |
| **Ficção Literária** | `#F0FDF4` (green-50) | `#15803D` (green-700) | `#BBF7D0` (green-200) |
| **Distopia** | `#F5F3FF` (violet-50) | `#6D28D9` (violet-700) | `#DDD6FE` (violet-200) |

### Cores de Status

| Status | Background | Texto | Borda |
|---|---|---|---|
| **Lido** ✓ | `#ECFDF5` (emerald-50) | `#047857` (emerald-700) | `#A7F3D0` (emerald-200) |
| **Baixado** ↓ | `#ECFEFF` (cyan-50) | `#0E7490` (cyan-700) | `#A5F3FC` (cyan-200) |
| **Na Fila** ☰ | `#FFFBEB` (amber-50) | `#B45309` (amber-700) | `#FDE68A` (amber-200) |
| **Erro/Deletar** | `#FEF2F2` (red-50) | `#EF4444` (red-400→500) | `#FECACA` (red-200) |
| **EPUB disponível** | `#ECFDF5` (emerald-50) | `#047857` (emerald-700) | `#A7F3D0` (emerald-200) |
| **Visualizar EPUB** | `#F0F9FF` (sky-50) | `#0369A1` (sky-700) | `#BAE6FD` (sky-200) |

### Badges Especiais (sobre a capa)

| Badge | Background | Texto |
|---|---|---|
| **DISTOPIA** | `#7C3AED` (violet-600) | `#FFFFFF` |
| **🇧🇷 NACIONAL** | `#14B8A6` | `#FFFFFF` |
| **SÉRIE / DUOLOGIA / TRILOGIA** | `#F59E0B` (amber-500) | `#FFFFFF` |

### Overlay e Transparências

| Uso | Valor |
|---|---|
| Overlay do modal (backdrop) | `rgba(15, 34, 64, 0.70)` — `#0F2240` 70% |
| Overlay do modal de formulário | `rgba(15, 34, 64, 0.60)` |
| Hover overlay da capa | `rgba(30, 58, 95, 0.40)` |
| Background gradiente login | `linear-gradient(to bottom, rgba(20,184,166,0.25), rgba(30,58,95,0.5), #0F2240)` |

---

## 2. Tipografia

### Famílias

| Família | Pesos | Usado em |
|---|---|---|
| **Roboto** | 300 · 400 · 500 · 700 · 900 | Toda a interface — `index.html` e `login.html` |
| **Merriweather** | 300 · 400 · 700 | EPUB Viewer — opção de fonte de leitura |
| **Lora** | 400 · 500 · 700 | EPUB Viewer — opção de fonte de leitura |
| **Source Sans 3** | 400 · 600 · 700 | EPUB Viewer — opção de fonte de leitura |

### Escala de Texto

| Nível | Tamanho | Peso | Uso |
|---|---|---|---|
| Display | `text-2xl` (24px) | 900 (Black) | Títulos de modal/formulário |
| H1 | `text-xl` (20px) | 700 (Bold) | Número de ordem na fila |
| H3 | `text-sm` → `text-[15px]` | 700 (Bold) | Título do livro no card |
| Label | `text-xs` (12px) | 700 (Bold) | Autor, editora, meta-info |
| Micro | `text-[11px]` | 500/700 | Tags, séries, páginas |
| Nano | `text-[10px]` · `text-[9px]` · `text-[8px]` | 700–900 | Badges uppercase, labels de seção |
| Body | `text-sm` (14px) | 400 | Sinopse no formulário |
| Body small | `text-[13px]` | 400 | Sinopse na prévia do catálogo |

### Padrões Tipográficos Recorrentes

```
Label de seção uppercase:
  font-size: 10–11px | font-weight: 900 | letter-spacing: 0.3em | text-transform: uppercase | color: gray-400

Badge de gênero (mini):
  font-size: 8px | font-weight: 700 | letter-spacing: 0.08em | text-transform: uppercase

Título do livro no card:
  font-size: 13–14px | font-weight: 700 | line-height: 1.4 | line-clamp: 2

Sinopse/corpo:
  font-size: 13px | font-weight: 400 | line-height: relaxed (1.625)
```

---

## 3. Espaçamento e Grid

### Sistema de Espaçamento (Tailwind)

| Token | Valor px | Uso |
|---|---|---|
| `gap-1` | 4px | Ícones internos, badges agrupados |
| `gap-1.5` | 6px | Mini-botões de status no card |
| `gap-2` | 8px | Botões lado a lado, campos de formulário |
| `gap-3` | 12px | Gêneros na nav, itens internos |
| `gap-4` | 16px | Grid de campos no formulário |
| `gap-5` | 20px | Items da fila de leitura |
| `gap-10` | 40px | Layout capa + info no modal (mobile) |
| `gap-16` | 64px | Layout capa + info no modal (desktop) |

### Padding de Componentes

| Componente | Padding |
|---|---|
| Card de livro (conteúdo) | `pt-3 px-3 pb-2` |
| Card da fila | `p-4` |
| Modal (mobile) | `px-6 py-8` |
| Modal (desktop) | `px-14 py-16` |
| Modal header | `px-6 md:px-10 py-5` |
| Input/Select | `px-4 py-3` |
| Botão grande | `py-4 px-6` |
| Botão médio | `py-3 px-4` |
| Botão pequeno | `px-5 py-2.5` |
| Badge de gênero | `px-2 py-1` (pequeno) · `px-4 py-1.5` (detalhe) |
| Badge especial (capa) | `px-2.5 py-1` |
| Genre nav row | `padding: 0.75rem 1.5rem` |

### Grid do Catálogo

```
Mobile:  grid-cols-2  →  2 colunas
Tablet:  grid-cols-3  →  3 colunas
Desktop: grid-cols-4 – 5  →  4–5 colunas
Gap: gap-4 (16px)
```

---

## 4. Raios de Borda (Border Radius)

| Componente | Valor | Classe Tailwind |
|---|---|---|
| Card de livro (grid) | 24px | `rounded-[24px]` |
| Card da fila (queue) | 28px | `rounded-[28px]` |
| Modal (desktop) | 40px | `rounded-[40px]` |
| Modal (mobile, topo) | 32px topo | `rounded-t-[32px]` |
| Capa no modal | 32px + borda 10px branca | `rounded-[32px] border-[10px] border-white` |
| Formulário add/edit | 24px | `rounded-3xl` |
| Seção de busca no form | 16px | `rounded-2xl` |
| Inputs | 12px | `rounded-xl` |
| Botão principal grande | 16px | `rounded-2xl` |
| Botão médio | 12px | `rounded-xl` |
| Botão circular (fechar modal) | 50% | `rounded-full` |
| Badge de gênero (card) | 8px | `rounded-lg` |
| Badge de gênero (detalhe) | 50% | `rounded-full` |
| Badge especial (sobre capa) | 4px | `rounded` |
| Badge "Claude ativo" | 50% | `rounded-full` |
| Preview miniatura na busca | 4px | `rounded` |
| Seção EPUB no form | 12px | `rounded-xl` |
| Comentário | 12px | `rounded-xl` |
| Confirmar delete | 16px | `rounded-2xl` |

---

## 5. Sombras (Shadows)

| Contexto | Valor |
|---|---|
| Card em repouso | `shadow-sm` |
| Card em hover | `shadow-2xl shadow-[#14B8A6]/10` |
| Modal | `shadow-2xl` |
| Badge sobre capa | `shadow-lg` |
| Capa no modal | `shadow-2xl` |
| Botão "Lido" ativo | `shadow-md shadow-[#1E3A5F]/20` |
| Botão "Baixado" ativo | `shadow-md shadow-[#14B8A6]/20` |
| Botão "Adicionar" no card | `hover:shadow-md` |
| Fila item | `shadow-sm`, hover: `shadow-md` |

---

## 6. Componentes

### 6.1 Book Card — Modo Grid

```
Dimensões: flex-col h-full
Border radius: 24px
Background: branco
Borda: border-transparent → hover: border-[#14B8A6]
Shadow: shadow-sm → hover: shadow-2xl shadow-[#14B8A6]/10
Hover: translateY(-4px) + border teal + cover scale(1.10) 300ms ease-out

Estrutura:
  ┌─────────────────────────┐
  │  CAPA (aspect 3:4.2)    │  ← overflow-hidden bg-gray-50
  │  [Badges no topo esq.]  │  ← absolute, z-10
  │  [Botão download]       │  ← absolute bottom-right, z-30
  │  [Overlay VER DETALHES] │  ← opacity-0 → group-hover opacity-100
  ├─────────────────────────┤
  │  Título (bold, 13px)    │  ← line-clamp-2, hover: text-teal
  │  Autor (400, 10-11px)   │  ← text-gray-400
  │  ─────────────────────  │
  │  [Badge gênero] [Ação]  │  ← mt-auto
  │  [●] [↓] [☰]           │  ← mini botões status, 24x24px
  └─────────────────────────┘

Overlay "VER DETALHES":
  Background: rgba(30,58,95,0.40) backdrop-blur-[2px]
  Pill: bg-white text-navy px-5 py-2.5 rounded-full font-black text-[11px] uppercase
```

### 6.2 Book Card — Modo Fila (Queue)

```
Border radius: 28px
Background: branco
Borda: border-gray-100

Estrutura horizontal:
  [≡ drag] [nº] [CAPA 48×72px] [TÍTULO+AUTOR+BADGE] [↑↓ mover] [🗑 remover]

Drag handle: 6 linhas horizontais (3.5 × 2px), cor gray-300 → teal no hover
Número: 20–28px, font-black, gray-200
Capa: rounded-lg, shadow-md
```

### 6.3 Detail Modal (Ficha Técnica)

```
Trigger: qualquer card
Posição: fixed inset-0 z-50
Mobile: bottom sheet — rounded-t-[32px], animate-slide-up
Desktop: centro — rounded-[40px], max-w-4xl

Overlay: rgba(15,34,64,0.70) backdrop-blur-md

Estrutura:
  ┌────────────────────────────────────────────────┐
  │ [FICHA TÉCNICA]              [✕ fechar]         │ ← sticky header
  ├──────────────────┬─────────────────────────────┤
  │                  │ Título (bold, grande)        │
  │   CAPA           │ Autor                        │
  │   rounded-[32px] │ Badge gênero (pill rounded)  │
  │   border-10 branca│ Sinopse                    │
  │   shadow-2xl     │ Tags (chips)                 │
  │                  │ Info (editora, páginas, série)│
  │ [+ Lista leitura]│                              │
  │ [✓ Lido][↓ Baixado]│                           │
  │ [Baixar EPUB]    │                              │
  │ [Visualizar EPUB]│                              │
  │ [Enviar EPUB]    │ [Comentários]                │
  │ [Editar] [Excluir]│                             │
  └──────────────────┴─────────────────────────────┘

Botões de ação (na coluna esquerda):
  + Lista de Leitura: w-full, py-4, rounded-2xl, borda-2, amber ativo / gray inativo
  Lido / Baixado: flex-1, py-3, rounded-xl, navy ativo / gray inativo
  EPUB (download/visualizar/upload): w-full, py-3, rounded-xl, cores contextuais
```

### 6.4 Genre Navigation Bar

```
Posição: sticky abaixo do header
Background: #ffffff (force opaque)
Border-bottom: 1px solid #f1f5f9
Scroll: overflow-x-auto, whitespace-nowrap
Gap: 0.75rem
Padding: 0.75rem 1.5rem
scrollbar: hidden

Chip de gênero:
  Inativo: bg-white border-gray-200 text-gray-500 rounded-full px-4 py-1.5 text-xs font-semibold
  Ativo: bg-[#1E3A5F] border-[#1E3A5F] text-white
  Hover: bg-gray-50 border-gray-300 text-gray-700
```

### 6.5 Toast / Notificação

```
Posição: fixed top-4 right-4 z-[80]
Largura: min(92vw, 360px)
Stack: flex-col gap-2 (mais recente por cima)
Duration: 4 segundos

Toast individual:
  Borda-esquerda colorida por tom
  Padding: px-4 py-3
  Border-radius: rounded-2xl
  Shadow: shadow-xl

Tons:
  success: borda verde, bg-emerald-50/90, text-emerald-800
  error:   borda vermelha, bg-red-50/90, text-red-800
  info:    borda teal, bg-white/90, text-gray-800
  warning: borda amber, bg-amber-50/90, text-amber-800
```

### 6.6 Add/Edit Book Form (Modal)

```
Overlay: rgba(15,34,64,0.60) backdrop-blur-sm
Card: bg-white max-w-2xl rounded-3xl shadow-2xl border-gray-100 p-6 md:p-8

Seções internas:
  Buscar Livro: rounded-2xl border border-[#1E3A5F]/10 bg-[#1E3A5F]/3% p-4
  Prévia do Catálogo: bg-white border-gray-100 rounded-2xl p-4
  Campos do formulário: grid grid-cols-1 md:grid-cols-2 gap-4
  Arquivo EPUB: p-4 border-gray-200 rounded-xl bg-gray-50
  Botões finais: flex gap-3 justify-end

Hierarquia de labels:
  "BUSCAR LIVRO", "SELECIONE O RESULTADO", "PRÉVIA DO CATÁLOGO"
  → text-[11px] uppercase tracking-widest font-black text-[#1E3A5F] ou gray-500
```

---

## 7. Inputs e Formulários

### Input / Select / Textarea

```css
/* Estado padrão */
padding: 12px 16px (py-3 px-4)
border: 1px solid #E5E7EB (gray-200)
background: #FFFFFF
color: #111827 (gray-900)
border-radius: 12px (rounded-xl)
font-size: inherit

/* Focus */
outline: none
ring: 2px solid rgba(20,184,166,0.30)
border-color: #14B8A6
```

### Input de busca no formulário

```css
padding: 10px 16px (py-2.5 px-4)
border-radius: 12px (rounded-xl)
focus-ring: rgba(20,184,166,0.30)
border-focus: #14B8A6
```

---

## 8. Botões

### Hierarquia de Botões

#### Primário (CTA principal)
```css
background: #14B8A6
color: #FFFFFF
font-weight: 600
padding: py-2.5 px-5 (ou py-4 px-6 para large)
border-radius: rounded-xl (ou rounded-2xl)
hover: background #0d9e8e
disabled: opacity 0.60
```

#### Secundário (escuro)
```css
background: #1E3A5F
color: #FFFFFF
hover: background #162d4a
```

#### Ghost / Outline
```css
background: transparent
border: 1px solid #E5E7EB (gray-200)
color: #6B7280 (gray-500)
hover: background gray-50
```

#### Perigo (Destructive)
```css
background: #EF4444 (red-500)
color: #FFFFFF
context: confirmações de exclusão
```

#### Ações de status (toggle)
```
Tamanho: 24×24px (w-6 h-6) — rounded-full — border
Inativo: bg-white border-gray-200 text-gray-500
Lido ativo: bg-emerald-50 text-emerald-700 border-emerald-200
Baixado ativo: bg-cyan-50 text-cyan-700 border-cyan-200
Fila ativo: bg-amber-50 text-amber-700 border-amber-200
```

#### Botão "Ver Detalhes" (hover overlay da capa)
```
Pill branca: bg-white text-[#1E3A5F] px-5 py-2.5 rounded-full text-[11px] font-black uppercase shadow-xl
```

---

## 9. Sistema de Ícones

Todos os ícones são SVGs inline com `viewBox="0 0 24 24"`, traço (`stroke`), sem preenchimento.

| Nome | Uso |
|---|---|
| `search` | Campo de busca |
| `bookOpen` | Visualizar EPUB, biblioteca vazia |
| `bookMarked` | Enviar EPUB |
| `download` | Baixar arquivo |
| `check` | Marcar como lido, confirmação |
| `x` | Fechar modal |
| `library` | Ícone geral de biblioteca |
| `image` | Placeholder de capa |
| `layers` | Modo de visualização (camadas) |
| `up` / `down` | Reordenar na fila |
| `list` | Lista de leitura (fila) |
| `grid` | Modo grade |
| `plus` | Adicionar |
| `trash` | Excluir |
| `edit` | Editar livro |
| `messageCircle` | Chat entre perfis |
| `bell` | Notificações |

```
Tamanho padrão: w-5 h-5 (20px)
Tamanho pequeno: w-3 h-3 (12px), w-3.5 h-3.5 (14px), w-4 h-4 (16px)
stroke-width: 2
stroke-linecap: round | stroke-linejoin: round
```

---

## 10. Animações

| Nome | Duração | Easing | Uso |
|---|---|---|---|
| `fadeIn` | 300ms | ease-out | Aparecer conteúdo geral |
| `fadeInDown` | 380ms | cubic-bezier(0.22,1,0.36,1) | Dropdowns, painéis |
| `slideUp` | 400ms | cubic-bezier(0.16,1,0.3,1) | Modal bottom sheet |
| `book-card-hover` | 200ms | ease-in-out | `translateY(-4px)` no hover |
| `add-card-pop` | 380ms | cubic-bezier(0.22,1,0.36,1) | Click no botão de adicionar livro |
| `bell-ring` | 500ms | cubic-bezier(0.36,0.07,0.19,0.97) | Notificação nova |
| `profile-switch-spin` | 550ms | cubic-bezier(0.34,1.56,0.64,1) | Troca de perfil |
| `profile-ring-pulse` | 600ms | ease-out | Ring teal ao trocar perfil |
| `logout-shake` | 400ms | cubic-bezier(0.36,0.07,0.19,0.97) | Feedback ao sair |
| `card-enter` | 800ms | ease-out | Entrada do card de login |
| `pulse-glow` | 6–8s | ease-in-out infinite | Glows de background (login) |
| `beam-lr/rl/tb/bt` | 5.5s | ease-in-out infinite | Raios de luz na borda do card (login) |
| `cover scale` | 700ms | ease | `scale(1.10)` na capa ao hover |

---

## 11. Página de Login — Visão Geral

A login.html tem uma identidade visual própria, separada da biblioteca.

```
Background geral: #0F2240 (navy-deep)
Gradiente de fundo: rgba(20,184,166,0.25) → rgba(30,58,95,0.5) → #0F2240
Fonte: Inter

Elementos de background animados:
  .glow-top: elipse teal top, blur 80px, animate 8s
  .glow-bottom: elipse teal bottom, blur 60px, animate 6s
  .glow-spot.left / .right: esferas brancas/transparentes, blur 100px

Card de login:
  max-width: 480px
  border-radius: 1rem (16px)
  animate: card-enter (fadeUp 800ms)
  card-3d: perspective 1500px, mouse tilt effect

Borda animada do card:
  4 raios de luz teal percorrem cada lado (beam-top/right/bottom/left)
  Corner glows nos 4 cantos (3D feel)
  border-glow hover: linear-gradient teal no inset

Formulário de login:
  Inputs: bg-white/5 border-white/10 text-white placeholder-white/30
  Botão submit: bg-[#14B8A6] hover:bg-[#0d9e8e]
  Remember me: checkbox + "Manter conectada"
  Esqueceu senha: text-white/50 hover:text-white/80
```

---

## 12. EPUB Viewer — Visão Geral

```
Background: #0F2240 (mesmo navy-deep da login)
Gradiente: mesmo da login (teal → navy → navy-deep)
Fonte padrão: Roboto; alternativas: Merriweather, Lora, Source Sans 3

Painel de controles:
  Navegação de capítulos (prev/next)
  Seletor de fonte
  Controle de tamanho da fonte
  Tudo sobre background semi-transparente com blur
```

---

## 13. Integração com Figma e GitHub

### Como integrar o Figma com este projeto

#### Opção 1 — Figma MCP (via Claude Code)

O Claude Code tem acesso nativo ao **Figma via MCP**. Você pode:

1. Criar um arquivo no Figma e compartilhar a URL aqui no chat
2. Pedir para o Claude exportar componentes do código para o Figma, ou buscar contexto de design de um arquivo Figma existente

Exemplo de comando:
```
"Cria um componente BookCard no Figma com base neste design system"
"Lê o design do frame X no Figma e implementa em HTML"
```

#### Opção 2 — Figma Code Connect

O Figma Code Connect vincula componentes do Figma a componentes do código, aparecendo diretamente no painel Dev do Figma.

```bash
# Instalar o CLI do Figma
npm install --save-dev @figma/code-connect

# Criar mapeamentos (após criar os componentes no Figma)
npx figma connect create
```

Um arquivo de mapeamento ficaria assim:

```js
// BookCard.figma.js
import figma from "@figma/code-connect";

figma.connect(
  "https://figma.com/design/SEU_FILE_KEY/...",  // URL do componente no Figma
  {
    props: {
      genre: figma.enum("Gênero", {
        Fantasia:   "Fantasia",
        Romantasy:  "Romantasy",
        Thriller:   "Thriller",
      }),
      isRead:     figma.boolean("Lido"),
      hasCover:   figma.boolean("Com Capa"),
    },
    example: ({ genre, isRead }) => `
      <BookCard
        genre="${genre}"
        isRead={${isRead}}
        onClick={handleClick}
      />
    `,
  }
);
```

#### Opção 3 — GitHub Actions para sync automático

Você pode configurar uma GitHub Action que publica o design system atualizado na Vercel como Storybook, ou que roda `figma connect publish` automaticamente ao fazer push na `main`:

```yaml
# .github/workflows/figma-connect.yml
name: Figma Code Connect

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx figma connect publish
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
```

Você precisaria:
1. Criar um token de acesso em figma.com → Configurações → Tokens de Acesso
2. Adicionar como secret `FIGMA_ACCESS_TOKEN` no repositório (Settings → Secrets → Actions)

---

## 14. Variáveis CSS para o Figma (pronto para copiar)

```css
:root {
  /* Brand */
  --color-teal:       #14B8A6;
  --color-teal-dark:  #0d9e8e;
  --color-navy:       #1E3A5F;
  --color-navy-deep:  #0F2240;

  /* Surface */
  --color-bg:         #F8F9FB;
  --color-surface:    #FFFFFF;
  --color-border:     #E5E7EB;

  /* Text */
  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted:     #9CA3AF;

  /* Genre — Fantasia */
  --genre-fantasia-bg:     #ECFDF5;
  --genre-fantasia-text:   #047857;
  --genre-fantasia-border: #A7F3D0;

  /* Genre — Romantasy */
  --genre-romantasy-bg:     #ECFEFF;
  --genre-romantasy-text:   #0E7490;
  --genre-romantasy-border: #A5F3FC;

  /* Genre — Ficção Científica */
  --genre-scifi-bg:     #EFF6FF;
  --genre-scifi-text:   #1D4ED8;
  --genre-scifi-border: #BFDBFE;

  /* Genre — Thriller */
  --genre-thriller-bg:     #F0FDFA;
  --genre-thriller-text:   #0F766E;
  --genre-thriller-border: #99F6E4;

  /* Genre — Romance Contemporâneo */
  --genre-romance-bg:     #F0F9FF;
  --genre-romance-text:   #0369A1;
  --genre-romance-border: #BAE6FD;

  /* Genre — Ficção Literária */
  --genre-literaria-bg:     #F0FDF4;
  --genre-literaria-text:   #15803D;
  --genre-literaria-border: #BBF7D0;

  /* Genre — Distopia */
  --genre-distopia-bg:     #F5F3FF;
  --genre-distopia-text:   #6D28D9;
  --genre-distopia-border: #DDD6FE;

  /* Status */
  --status-read-bg:       #ECFDF5;
  --status-read-text:     #047857;
  --status-read-border:   #A7F3D0;

  --status-download-bg:     #ECFEFF;
  --status-download-text:   #0E7490;
  --status-download-border: #A5F3FC;

  --status-queue-bg:     #FFFBEB;
  --status-queue-text:   #B45309;
  --status-queue-border: #FDE68A;

  /* Radius */
  --radius-card:   24px;
  --radius-queue:  28px;
  --radius-modal:  40px;
  --radius-input:  12px;
  --radius-button: 12px;
  --radius-badge:  999px;

  /* Animation durations */
  --duration-hover:   200ms;
  --duration-modal:   400ms;
  --duration-fade:    300ms;
}
```

---

*Gerado em 2026-04-07 — Design System v1.0*
