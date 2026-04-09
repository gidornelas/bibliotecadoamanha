/**
 * api/send-to-kindle.js — Vercel Serverless Function
 * Envia um EPUB por email para o Kindle via Resend.
 *
 * POST /api/send-to-kindle
 * Body (opção A — livro já importado): { epubUrl, fileName }
 * Body (opção B — direto do Telegram):  { messageId, chatId, fileName }
 *
 * Variáveis de ambiente (Vercel):
 *   RESEND_API_KEY   — obtida em resend.com (gratuito)
 *   KINDLE_EMAIL     — giannydornelas@kindle.com (já definida no código)
 *   TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION (opção B)
 */

import { Resend } from 'resend';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

const KINDLE_EMAIL = 'giannydornelas@kindle.com';
const FROM_EMAIL   = process.env.RESEND_FROM_EMAIL || 'kindle@bibliotecadoamanha.app';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function downloadFromUrl(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar arquivo: ${r.status}`);
  const arrayBuffer = await r.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function downloadFromTelegram(messageId, chatId) {
  const apiId    = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash  = process.env.TELEGRAM_API_HASH;
  const sessionStr = process.env.TELEGRAM_SESSION;
  const targetChat = chatId || process.env.TELEGRAM_CHAT_ID;

  const client = new TelegramClient(
    new StringSession(sessionStr),
    apiId, apiHash,
    { connectionRetries: 3, timeout: 20 }
  );

  try {
    await client.connect();
    const [message] = await client.getMessages(targetChat, { ids: [messageId] });
    if (!message) throw new Error('Mensagem não encontrada no Telegram.');
    const buffer = await client.downloadMedia(message, { workers: 1 });
    if (!buffer || buffer.length === 0) throw new Error('Download retornou vazio.');
    return buffer;
  } finally {
    try { await client.disconnect(); } catch (_) {}
  }
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { epubUrl, messageId, chatId, fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: 'fileName é obrigatório.' });
  }
  if (!epubUrl && !messageId) {
    return res.status(400).json({ error: 'Forneça epubUrl ou messageId.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada.' });
  }

  try {
    // Baixa o arquivo
    const buffer = epubUrl
      ? await downloadFromUrl(epubUrl)
      : await downloadFromTelegram(parseInt(messageId, 10), chatId);

    const safeName = fileName.endsWith('.epub') ? fileName : fileName + '.epub';

    // Envia via Resend
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from    : FROM_EMAIL,
      to      : KINDLE_EMAIL,
      subject : safeName.replace('.epub', ''),
      text    : `Livro enviado pela Biblioteca do Amanhã: ${safeName}`,
      attachments: [{
        filename : safeName,
        content  : buffer.toString('base64'),
      }],
    });

    if (error) {
      console.error('[send-to-kindle] Resend error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, emailId: data?.id });

  } catch (err) {
    console.error('[send-to-kindle]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
