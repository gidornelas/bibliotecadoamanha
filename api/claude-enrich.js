// Lean enrichment endpoint — receives pre-fetched book data from the browser
// and calls Claude server-side using ANTHROPIC_API_KEY env var.
// No API key is ever exposed to the browser.

const ALLOWED_GENRES = [
  'Fantasia',
  'Romantasy',
  'Ficção Científica',
  'Thriller',
  'Romance Contemporâneo',
  'Ficção Literária',
  'Distopia',
];

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function safeParseJson(text = '') {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ ok: false, error: 'api-key-not-configured' });
    return;
  }

  const body = req.body || {};
  if (!body.title) {
    res.status(400).json({ ok: false, error: 'missing-title' });
    return;
  }

  const systemPrompt = [
    'Você é um especialista em literatura. Analise os dados brutos de um livro e retorne um JSON enriquecido.',
    'Responda APENAS JSON válido, sem markdown, sem texto extra.',
    '',
    '"synopsis": escreva em português brasileiro, 3-5 frases descritivas sem spoilers.',
    '"genre": exatamente um de: Fantasia | Romantasy | Ficção Científica | Thriller | Romance Contemporâneo | Ficção Literária | Distopia',
    '"tags": array de strings, 4-8 itens, tropos e atmosfera (ex: enemies to lovers, slow burn, dual POV, plot twist, YA, série, dark academia, found family, mistério investigativo, suspense psicológico)',
    '"publisher": editora brasileira conhecida se possível, senão a original',
    '"isSeries": boolean, "series": nome da série ou string vazia, "volume": número ou 0',
    '"pages": número se conhecido com certeza, senão mantenha o original ou 0',
  ].join('\n');

  const userPayload = {
    title: clean(body.title),
    author: clean(body.author),
    publisher: clean(body.publisher),
    publishYear: body.publishYear || null,
    pages: Number(body.pages) || 0,
    synopsis: clean(body.synopsis),
    rawCategories: Array.isArray(body.rawCategories) ? body.rawCategories.slice(0, 10) : [],
  };

  let response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          temperature: 0.2,
          system: systemPrompt,
          messages: [{ role: 'user', content: JSON.stringify(userPayload) }],
        }),
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    res.status(504).json({ ok: false, error: 'timeout-or-network', details: err.message });
    return;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    res.status(502).json({ ok: false, error: 'claude-error', details: clean(errorText) || `HTTP ${response.status}` });
    return;
  }

  const data = await response.json().catch(() => null);
  const text = data?.content?.[0]?.text || '';
  const parsed = safeParseJson(text);

  if (!parsed || typeof parsed !== 'object') {
    res.status(502).json({ ok: false, error: 'invalid-json-from-claude' });
    return;
  }

  const genre = ALLOWED_GENRES.includes(parsed.genre) ? parsed.genre : '';
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toLowerCase())
    : [];

  res.status(200).json({
    ok: true,
    profile: {
      title:      clean(parsed.title      || body.title),
      author:     clean(parsed.author     || body.author),
      publisher:  clean(parsed.publisher  || body.publisher || ''),
      pages:      Number(parsed.pages     || body.pages     || 0),
      synopsis:   clean(parsed.synopsis   || ''),
      genre,
      tags:       tags.slice(0, 10),
      isSeries:   !!parsed.isSeries,
      series:     clean(parsed.series     || ''),
      volume:     Number(parsed.volume    || 0),
    },
  });
}
