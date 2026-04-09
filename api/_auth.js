/**
 * api/_auth.js — Helper de verificação de autenticação Firebase
 *
 * Verifica o ID token do Firebase enviado no header Authorization.
 * Usa a REST API pública do Firebase (sem firebase-admin).
 *
 * Variável de ambiente necessária:
 *   FIREBASE_API_KEY — mesma chave pública do projeto Firebase
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'https://biblioteca-do-amanha.vercel.app')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

/**
 * Configura headers CORS restritivos.
 * Em vez de '*', só permite a origem do app em produção.
 */
export function setCors(res, req) {
  const origin = req?.headers?.origin || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  // Em desenvolvimento (sem origin ou localhost), permite
  const isLocal = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');

  if (isAllowed || isLocal) {
    res.setHeader('Access-Control-Allow-Origin', origin || ALLOWED_ORIGINS[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Verifica o Firebase ID token e retorna o usuário, ou responde 401.
 * Retorna o objeto user do Firebase se válido, null caso contrário (já respondeu 401).
 */
export async function requireAuth(req, res) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    res.status(401).json({ error: 'unauthorized', details: 'Token ausente.' });
    return null;
  }

  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    // Se a variável não estiver configurada, falha segura: bloqueia acesso
    res.status(503).json({ error: 'auth-not-configured' });
    return null;
  }

  try {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!r.ok) {
      res.status(401).json({ error: 'unauthorized', details: 'Token inválido.' });
      return null;
    }

    const { users } = await r.json().catch(() => ({}));
    if (!users?.length) {
      res.status(401).json({ error: 'unauthorized', details: 'Usuário não encontrado.' });
      return null;
    }

    return users[0]; // { localId, email, ... }
  } catch {
    res.status(401).json({ error: 'unauthorized', details: 'Falha na verificação.' });
    return null;
  }
}
