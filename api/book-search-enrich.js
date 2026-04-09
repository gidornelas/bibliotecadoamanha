// Serverless proxy para enriquecimento de dados de livros via Claude.
// A chave ANTHROPIC_API_KEY fica somente no servidor (Vercel env var).
// Nenhuma chave é exposta ao browser.

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

  const prompt = `Você é um especialista em literatura. Analise os dados brutos abaixo sobre um livro e retorne um JSON enriquecido.

DADOS BRUTOS:
${JSON.stringify({
    title: body.title,
    author: body.author,
    publisher: body.publisher,
    publishYear: body.publishYear,
    pages: body.pages,
    synopsis: body.synopsis,
    rawCategories: Array.isArray(body.rawCategories) ? body.rawCategories.slice(0, 10) : [],
  }, null, 2)}

INSTRUÇÕES:
1. "synopsis": escreva em português (pt-BR), 3 a 5 frases descritivas. Se já houver, melhore e traduza.
2. "suggestedGenre": escolha UM dos valores: thriller | fantasy | romantasy | romance | sci-fi | dystopia | literary | unknown
3. "suggestedTags": array de objetos { "label": string, "type": string }. Gere entre 3 e 8 tags relevantes.
   - Tipos disponíveis: "pink" (tropos de romance), "purple" (fantasia/magia), "thriller" (suspense/crime), "teal" (ficção histórica, autoras brasileiras, sci-fi), "amber" (YA, séries, prêmios, adaptações), "gray" (outros)
   - Exemplos: "enemies to lovers", "slow burn", "dual POV", "plot twist", "YA", "série", "ficção histórica", "sistema de magia", "dark academia", "found family"
4. "seriesName": nome da série se detectado, ou null
5. "seriesVolume": número do volume se detectado, ou null
6. "seriesDetected": true se é parte de uma série, false caso contrário
7. "pages": número de páginas se souber com certeza, senão mantenha o original
8. "publisher": editora se souber, senão mantenha o original

Retorne SOMENTE JSON válido, sem texto extra:
{
  "title": string,
  "author": string,
  "allAuthors": string[],
  "publisher": string,
  "publishYear": number | null,
  "pages": number | null,
  "synopsis": string,
  "suggestedGenre": string,
  "suggestedTags": [{ "label": string, "type": string }],
  "seriesName": string | null,
  "seriesVolume": number | null,
  "seriesDetected": boolean
}`;

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
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
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
    res.status(502).json({ ok: false, error: 'claude-error', details: errorText || `HTTP ${response.status}` });
    return;
  }

  const data = await response.json().catch(() => null);
  const text = data?.content?.[0]?.text || '';
  const parsed = safeParseJson(text);

  if (!parsed || typeof parsed !== 'object') {
    res.status(502).json({ ok: false, error: 'invalid-json-from-claude' });
    return;
  }

  res.status(200).json({ ok: true, enriched: parsed });
}
