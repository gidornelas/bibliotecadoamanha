/**
 * api/telegram-search.js — Vercel Serverless Function
 * Busca arquivos EPUB num grupo do Telegram via MTProto (GramJS).
 *
 * GET /api/telegram-search?query=titulo
 *
 * Variáveis de ambiente necessárias (Vercel):
 *   TELEGRAM_API_ID      — número inteiro de my.telegram.org
 *   TELEGRAM_API_HASH    — string de my.telegram.org
 *   TELEGRAM_SESSION     — StringSession gerada por generate-session.mjs
 *   TELEGRAM_CHAT_ID     — ID ou username do grupo (ex: -1001234567890 ou @meugrupo)
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { Api } from 'telegram/tl/index.js';
import { setCors, requireAuth } from './_auth.js';

function formatSize(bytes) {
  if (!bytes) return '?';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { query } = req.query;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Parâmetro query obrigatório (mínimo 2 caracteres).' });
  }

  const apiId   = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionStr = process.env.TELEGRAM_SESSION;
  const chatId  = process.env.TELEGRAM_CHAT_ID;

  if (!apiId || !apiHash || !sessionStr || !chatId) {
    return res.status(500).json({ error: 'Variáveis de ambiente Telegram não configuradas.' });
  }

  const client = new TelegramClient(
    new StringSession(sessionStr),
    apiId,
    apiHash,
    { connectionRetries: 3, timeout: 20 }
  );

  try {
    await client.connect();

    const messages = await client.getMessages(chatId, {
      search: query.trim(),
      filter: new Api.InputMessagesFilterDocument(),
      limit: 20,
    });

    const files = messages
      .filter(msg => {
        const name = (msg.file?.name || '').toLowerCase();
        const mime = (msg.file?.mimeType || '').toLowerCase();
        return (
          name.endsWith('.epub') ||
          mime === 'application/epub+zip' ||
          mime.includes('epub')
        );
      })
      .map(msg => ({
        messageId : msg.id,
        fileName  : msg.file?.name || `arquivo_${msg.id}.epub`,
        size      : msg.file?.size || 0,
        sizeLabel : formatSize(msg.file?.size),
        mimeType  : msg.file?.mimeType || 'application/epub+zip',
        date      : msg.date ? new Date(msg.date * 1000).toISOString() : null,
        chatId    : chatId,
      }));

    return res.status(200).json({ success: true, query, total: files.length, files });

  } catch (err) {
    console.error('[telegram-search] erro:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    try { await client.disconnect(); } catch (_) {}
  }
}
