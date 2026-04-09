// Configuração Firebase - Biblioteca do Amanhã
// Para configurar o Firebase:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto chamado "biblioteca-amanha"
// 3. Ative o Firestore Database
// 4. Copie as configurações abaixo e substitua no código

const firebaseConfig = {
  apiKey: "AIzaSyBEXAMPLE", // Substitua pela sua API key real
  authDomain: "biblioteca-amanha.firebaseapp.com",
  projectId: "biblioteca-amanha",
  storageBucket: "biblioteca-amanha.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Regras de segurança do Firestore (adicione no console Firebase):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      // Só o próprio usuário autenticado pode ler/escrever seus dados.
      // NUNCA use || userId == 'default-user' — isso expõe dados sem autenticação.
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/