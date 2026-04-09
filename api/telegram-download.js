/**
 * api/telegram-download.js — Vercel Serverless Function
 * Baixa um arquivo do Telegram e faz upload ao Supabase Storage.
 *
 * POST /api/telegram-download
 * Body: { messageId, fileName, chatId }
 *
 * Variáveis de ambiente (Vercel):
 *   TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION, TELEGRAM_CHAT_ID
 *   SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { createClient } from '@supabase/supabase-js';
import { setCors, requireAuth } from './_auth.js';

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { messageId, fileName, chatId } = req.body;
  if (!messageId || !fileName) {
    return res.status(400).json({ error: 'messageId e fileName são obrigatórios.' });
  }

  const apiId    = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash  = process.env.TELEGRAM_API_HASH;
  const sessionStr = process.env.TELEGRAM_SESSION;
  const targetChat = chatId || process.env.TELEGRAM_CHAT_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const bucket      = process.env.SUPABASE_BUCKET || 'biblioteca-epubs';

  if (!apiId || !apiHash || !sessionStr) {
    return res.status(500).json({ error: 'Variáveis Telegram não configuradas.' });
  }
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Variáveis Supabase não configuradas.' });
  }

  const client = new TelegramClient(
    new StringSession(sessionStr),
    apiId,
    apiHash,
    { connectionRetries: 3, timeout: 25 }
  );

  try {
    await client.connect();

    const [message] = await client.getMessages(targetChat, { ids: [messageId] });
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada no Telegram.' });
    }

    const buffer = await client.downloadMedia(message, { workers: 1 });
    if (!buffer || buffer.length === 0) {
      return res.status(500).json({ error: 'Download retornou vazio.' });
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return res.status(413).json({ error: 'Arquivo muito grande. Limite de 10MB para EPUBs.' });
    }

    // Sanitiza para uma key ASCII válida no Supabase Storage
    const normalizedName = String(fileName || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    let safeName = normalizedName
      .replace(/[^a-zA-Z0-9._\- ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^[_\-.]+|[_\-.]+$/g, '');

    if (!safeName) {
      safeName = `telegram_${messageId}.epub`;
    }

    if (!/\.epub$/i.test(safeName)) {
      safeName = `${safeName}.epub`;
    }

    const storagePath = `epubs/${Date.now()}_${safeName}`;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType : 'application/epub+zip',
        upsert       : false,
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Upload falhou: ' + uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return res.status(200).json({
      success  : true,
      url      : publicUrl,
      path     : storagePath,
      size     : buffer.length,
      fileName : safeName,
    });

  } catch (err) {
    console.error('[telegram-download]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    try { await client.disconnect(); } catch (_) {}
  }
}
