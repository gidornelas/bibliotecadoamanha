/**
 * api/send-to-kindle.js â€” Vercel Serverless Function
 * Envia um EPUB por email para o Kindle via Gmail SMTP.
 *
 * POST /api/send-to-kindle
 * Body (opÃ§Ã£o A â€” livro jÃ¡ importado): { epubUrl, fileName }
 * Body (opÃ§Ã£o B â€” direto do Telegram):  { messageId, chatId, fileName }
 *
 * VariÃ¡veis de ambiente (Vercel):
 *   GMAIL_USER         â€” seu email Gmail (ex: gianny@gmail.com)
 *   GMAIL_APP_PASSWORD â€” App Password gerada no Google (nÃ£o Ã© a senha normal)
 *   KINDLE_EMAIL       â€” giannydornelas@kindle.com (jÃ¡ definido no cÃ³digo)
 *
 *   Para o Telegram (opÃ§Ã£o B):
 *   TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION, TELEGRAM_CHAT_ID
 */

import nodemailer from 'nodemailer';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { setCors, requireAuth } from './_auth.js';

const KINDLE_EMAILS = {
  'perfil-1': 'giannydornelas_6k8aBz@kindle.com',
  'perfil-2': 'laisamgb_lssotg@kindle.com',
  'perfil-3': 'mariaclaraegias@gmail.com',
};

async function downloadFromUrl(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar arquivo: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function downloadFromTelegram(messageId, chatId) {
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION),
    parseInt(process.env.TELEGRAM_API_ID, 10),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 3, timeout: 20 }
  );
  try {
    await client.connect();
    const [message] = await client.getMessages(chatId || process.env.TELEGRAM_CHAT_ID, { ids: [messageId] });
    if (!message) throw new Error('Mensagem nÃ£o encontrada no Telegram.');
    const buffer = await client.downloadMedia(message, { workers: 1 });
    if (!buffer || buffer.length === 0) throw new Error('Download retornou vazio.');
    return buffer;
  } finally {
    try { await client.disconnect(); } catch (_) {}
  }
}

export default async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  const { epubUrl, messageId, chatId, fileName, profileId } = req.body;

  if (!fileName) return res.status(400).json({ error: 'fileName Ã© obrigatÃ³rio.' });
  if (!epubUrl && !messageId) return res.status(400).json({ error: 'ForneÃ§a epubUrl ou messageId.' });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'GMAIL_USER ou GMAIL_APP_PASSWORD nÃ£o configurados.' });
  }

  const kindleEmail = KINDLE_EMAILS[profileId] || KINDLE_EMAILS['perfil-1'];
  try {
    const buffer   = epubUrl
      ? await downloadFromUrl(epubUrl)
      : await downloadFromTelegram(parseInt(messageId, 10), chatId);

    const safeName = fileName.endsWith('.epub') ? fileName : fileName + '.epub';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from        : `"Biblioteca do AmanhÃ£" <${gmailUser}>`,
      to          : kindleEmail,
      subject     : safeName.replace('.epub', ''),
      text        : `Livro enviado pela Biblioteca do AmanhÃ£: ${safeName}`,
      attachments : [{ filename: safeName, content: buffer }],
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[send-to-kindle]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

