/**
 * SCRIPT DE GERAÇÃO DE SESSÃO TELEGRAM (execução única)
 * -------------------------------------------------------
 * Rode UMA VEZ localmente:   node generate-session.mjs
 *
 * Pré-requisitos:
 *   1. npm install telegram input   (neste diretório)
 *   2. Ter API_ID e API_HASH de https://my.telegram.org
 *
 * O script vai pedir seu número de telefone, o código recebido
 * no Telegram e a senha 2FA (se tiver).
 *
 * Ao final, copie a string exibida e salve como:
 *   - Variável de ambiente no Vercel:  TELEGRAM_SESSION
 *   - Variável de ambiente no Railway: TELEGRAM_SESSION
 *
 * ATENÇÃO: Nunca comite essa string no git — ela é equivalente
 * à sua senha do Telegram.
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';

// ─── PREENCHA AQUI ───────────────────────────────────────────
const API_ID   = 0;           // número inteiro de my.telegram.org
const API_HASH = '';          // string  de my.telegram.org
// ─────────────────────────────────────────────────────────────

if (!API_ID || !API_HASH) {
  console.error('❌  Preencha API_ID e API_HASH no topo do arquivo antes de rodar.');
  process.exit(1);
}

const session = new StringSession('');

const client = new TelegramClient(session, API_ID, API_HASH, {
  connectionRetries: 5,
});

await client.start({
  phoneNumber : async () => await input.text('📱 Número de telefone (ex: +5511999999999): '),
  password    : async () => await input.text('🔑 Senha 2FA (deixe em branco se não tiver): '),
  phoneCode   : async () => await input.text('💬 Código recebido no Telegram: '),
  onError     : (err) => console.error('Erro:', err),
});

console.log('\n✅  Sessão gerada com sucesso!\n');
console.log('─'.repeat(60));
console.log('TELEGRAM_SESSION =', client.session.save());
console.log('─'.repeat(60));
console.log('\nSalve o valor acima nas variáveis de ambiente do Vercel e do Railway.');
console.log('NUNCA comite essa string no git.\n');

await client.disconnect();
