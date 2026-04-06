# Cenario Gratis Recomendado (GitHub Pages + Firebase + Supabase + Vercel)

Este projeto ja esta preparado para o melhor cenario sem custo:

- Frontend: GitHub Pages
- Auth e banco: Firebase (Spark/free)
- EPUB/storage: Supabase (Free)
- API de capas Goodreads/Skoob: Vercel (Hobby/free)

## 1) O que ja foi configurado

1. `index.html` ja contem a versao mais atual do app.
2. `api/cover.js` ja existe para proxy de capas online.
3. `vercel.json` ja esta pronto para runtime Node na Vercel.
4. O frontend ja tenta capas nesta ordem:
	1. `window.coverProxyBaseUrl` (quando definido)
	2. `window.location.origin/api/cover` (mesmo dominio)
	3. `http://localhost:8787/cover` (somente local)

## 2) Deploy do frontend no GitHub Pages

1. Suba o repositorio no GitHub.
2. Em `Settings > Pages`:
	- Source: `Deploy from a branch`
	- Branch: `main`
	- Folder: `/ (root)`
3. URL final esperada:
	- `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

## 3) Firebase (Spark/free)

No Firebase Console:

1. Authentication:
	- Ativar Google Sign-in.
2. Authorized domains:
	- Adicionar `SEU-USUARIO.github.io`.
3. Firestore rules (por usuario autenticado):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
	 match /users/{userId}/data/{docId} {
		allow read, write: if request.auth != null && request.auth.uid == userId;
	 }
  }
}
```

## 4) Supabase (Free)

1. Criar bucket `biblioteca-epubs`.
2. Confirmar URL e anon key no frontend.
3. Mantem o plano Free para custo zero.

## 5) API de capas na Vercel (Hobby/free)

1. Importar o mesmo repositorio na Vercel.
2. Deploy padrao (sem mudancas extras).
3. Endpoint publicado:
	- `https://SEU-PROJETO.vercel.app/api/cover`

## 6) Conectar GitHub Pages -> API da Vercel

Como o frontend vai estar no GitHub Pages (dominio diferente da Vercel), defina no topo do HTML:

```html
<script>
  window.coverProxyBaseUrl = 'https://SEU-PROJETO.vercel.app/api/cover';
</script>
```

Coloque esse trecho antes do script principal do app.

## 7) Checklist custo zero

1. Firebase no plano Spark (nao Blaze).
2. Supabase no plano Free.
3. Vercel no plano Hobby.
4. Alertas de uso ativados nas tres plataformas.
5. Nao habilitar upgrades automaticos.

## 8) Teste final

1. Abrir site no GitHub Pages.
2. Login Google funcionando.
3. Ler/escrever dados no Firestore.
4. Upload/download EPUB via Supabase.
5. Cards da curadoria carregando capas sem depender de localhost.
