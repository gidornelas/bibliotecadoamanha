/**
 * telegram-worker/index.js — Serviço Express para Railway
 * ─────────────────────────────────────────────────────────
 * Responsável por baixar EPUBs do Telegram e fazer upload ao Supabase.
 * Roda como servidor persistente (sem timeout de funções serverless).
 *
 * Variáveis de ambiente necessárias (Railway):
 *   TELEGRAM_API_ID      — número inteiro de my.telegram.org
 *   TELEGRAM_API_HASH    — string de my.telegram.org
 *   TELEGRAM_SESSION     — StringSession gerada por generate-session.mjs
 *   TELEGRAM_CHAT_ID     — ID do grupo (ex: -1001234567890)
 *   SUPABASE_URL         — URL do seu projeto Supabase
 *   SUPABASE_KEY         — chave service_role do Supabase
 *   SUPABASE_BUCKET      — nome do bucket (ex: biblioteca-epubs)
 *   ALLOWED_ORIGIN       — origem permitida (ex: https://bibliotecadoamanha.vercel.app)
 *   PORT                 — porta (Railway define automaticamente)
 */

import express from 'express';
import cors from 'cors';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { createClient } from '@supabase/supabase-js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('CORS: origem não permitida — ' + origin));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ─── Supabase ────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// ─── Telegram client (singleton por processo) ────────────────
let tgClient = null;

async function getTelegramClient() {
  if (tgClient && tgClient.connected) return tgClient;

  const apiId   = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const session = new StringSession(process.env.TELEGRAM_SESSION);

  tgClient = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await tgClient.connect();
  console.log('✅  Telegram conectado.');
  return tgClient;
}

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'telegram-worker' }));

// ─── POST /download ──────────────────────────────────────────
/**
 * Body: { messageId: number, fileName: string, chatId?: string }
 * Response: { success, url, path, size }
 */
app.post('/download', async (req, res) => {
  const { messageId, fileName, chatId } = req.body;

  if (!messageId || !fileName) {
    return res.status(400).json({ error: 'messageId e fileName são obrigatórios.' });
  }

  const targetChat = chatId || process.env.TELEGRAM_CHAT_ID;

  console.log(`📥  Iniciando download: ${fileName} (msg ${messageId})`);

  try {
    const client   = await getTelegramClient();
    const [message] = await client.getMessages(targetChat, { ids: [messageId] });

    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada no Telegram.' });
    }

    // Download do arquivo como Buffer
    const buffer = await client.downloadMedia(message, { workers: 4 });

    if (!buffer || buffer.length === 0) {
      return res.status(500).json({ error: 'Download retornou vazio.' });
    }

    console.log(`✅  Download concluído: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Sanitiza o nome do arquivo para usar como path no Supabase
    const safeName = fileName
      .replace(/[^a-zA-Z0-9._\-À-ú ]/g, '')
      .replace(/\s+/g, '_')
      .trim();

    const storagePath = `epubs/${Date.now()}_${safeName}`;

    // Upload ao Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'biblioteca-epubs')
      .upload(storagePath, buffer, {
        contentType : 'application/epub+zip',
        upsert       : false,
      });

    if (uploadError) {
      console.error('Erro no upload Supabase:', uploadError.message);
      return res.status(500).json({ error: 'Falha no upload: ' + uploadError.message });
    }

    // URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'biblioteca-epubs')
      .getPublicUrl(storagePath);

    console.log(`📤  Upload concluído: ${publicUrl}`);

    return res.status(200).json({
      success  : true,
      url      : publicUrl,
      path     : storagePath,
      size     : buffer.length,
      fileName : safeName,
    });

  } catch (err) {
    console.error('[/download] erro:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Inicialização ───────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀  telegram-worker rodando na porta ${PORT}`);
  // Pré-aquece a conexão Telegram na inicialização
  try {
    await getTelegramClient();
  } catch (err) {
    console.warn('⚠️  Telegram não conectou na inicialização:', err.message);
  }
});
