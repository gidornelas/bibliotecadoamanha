# Firebase + GitHub Pages (Biblioteca do Amanha)

## 1) Publicacao no GitHub Pages

1. Continue editando seu arquivo atual `index- modificações.html` normalmente.
2. Antes de publicar, renomeie para `index.html` na raiz do repositorio.
2. Envie os arquivos para o GitHub.
3. Em `Settings > Pages`, selecione:
	 - `Source`: Deploy from a branch
	 - `Branch`: `main` (ou `master`), pasta `/ (root)`
4. Aguarde o link final, no formato:
	 - `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

## 2) Firebase Authentication

No Firebase Console:

1. `Authentication > Sign-in method`
2. Ative `Google`
3. Em `Authentication > Settings > Authorized domains`, adicione:
	 - `SEU-USUARIO.github.io`

Sem este dominio autorizado, o login Google no GitHub Pages falha.

## 3) Firestore Database

No Firebase Console:

1. Crie o banco em `Firestore Database`
2. Use regras seguras por usuario autenticado:

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

## 4) Como o app salva os dados

- O app salva em: `users/{uid}/data/{key}`
- Cada usuario logado grava apenas os proprios dados

## 5) Teste final apos deploy

1. Abra o link do GitHub Pages
2. Clique em `Entrar com Google`
3. Marque livros como lido/baixado e fila
4. Recarregue a pagina
5. Confirme que os dados continuam salvos

## 6) Observacoes

- `apiKey` do Firebase no frontend e normal.
- Seguranca real vem de:
	- Firebase Auth
	- Regras do Firestore
