const ALLOWED_GENRES = [
  'Fantasia',
  'Romantasy',
  'Ficção Científica',
  'Thriller',
  'Romance Contemporâneo',
  'Ficção Literária',
  'Distopia'
];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

function cleanText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json,text/plain,*/*'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchWikiSummary(query = '') {
  const q = cleanText(query);
  if (!q) return null;

  try {
    const search = await fetchJson(`https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`);
    const title = search?.query?.search?.[0]?.title;
    if (!title) return null;
    const summary = await fetchJson(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    return {
      title: cleanText(summary?.title || ''),
      extract: cleanText(summary?.extract || '')
    };
  } catch {
    return null;
  }
}

async function fetchGoogleBooksEvidence(title = '', author = '') {
  const query = [title, author].filter(Boolean).join(' ').trim();
  if (!query) return null;

  try {
    const data = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&country=BR&printType=books&maxResults=3&orderBy=relevance`);
    const volume = data?.items?.[0]?.volumeInfo;
    if (!volume) return null;
    return {
      title: cleanText(volume?.title || ''),
      authors: Array.isArray(volume?.authors) ? volume.authors.map(cleanText).filter(Boolean) : [],
      description: cleanText(volume?.description || ''),
      categories: Array.isArray(volume?.categories) ? volume.categories.map(cleanText).filter(Boolean) : [],
      publisher: cleanText(volume?.publisher || ''),
      pageCount: Number(volume?.pageCount || 0)
    };
  } catch {
    return null;
  }
}

async function fetchOpenLibraryEvidence(title = '', author = '') {
  const query = [title, author].filter(Boolean).join(' ').trim();
  if (!query) return null;

  try {
    const data = await fetchJson(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=3`);
    const doc = data?.docs?.[0];
    if (!doc) return null;
    return {
      title: cleanText(doc?.title || ''),
      authors: Array.isArray(doc?.author_name) ? doc.author_name.map(cleanText).filter(Boolean) : [],
      subjects: Array.isArray(doc?.subject) ? doc.subject.map(cleanText).filter(Boolean).slice(0, 12) : [],
      publishers: Array.isArray(doc?.publisher) ? doc.publisher.map(cleanText).filter(Boolean).slice(0, 5) : [],
      firstSentence: cleanText(Array.isArray(doc?.first_sentence) ? doc.first_sentence[0] : doc?.first_sentence || '')
    };
  } catch {
    return null;
  }
}

async function collectWebEvidence(payload = {}) {
  const title = cleanText(payload.title || '');
  const author = cleanText(payload.author || '');
  const wikiQuery = [title, author, 'livro'].filter(Boolean).join(' ');

  const [googleBooks, openLibrary, wikipedia] = await Promise.all([
    fetchGoogleBooksEvidence(title, author),
    fetchOpenLibraryEvidence(title, author),
    fetchWikiSummary(wikiQuery)
  ]);

  const combinedSubjects = [
    ...(googleBooks?.categories || []),
    ...(openLibrary?.subjects || [])
  ].filter(Boolean);

  const combinedDescriptions = [
    payload.synopsis || '',
    googleBooks?.description || '',
    openLibrary?.firstSentence || '',
    wikipedia?.extract || ''
  ].filter(Boolean).join(' ');

  return {
    googleBooks,
    openLibrary,
    wikipedia,
    subjects: normalizeTags(combinedSubjects),
    description: cleanText(combinedDescriptions)
  };
}

function buildTropeTags(categories = [], synopsis = '', genre = '', webSubjects = []) {
  const pool = `${(categories || []).join(' ')} ${(webSubjects || []).join(' ')} ${synopsis || ''} ${genre || ''}`.toLowerCase();
  const checks = [
    [/triangulo amoroso|triângulo amoroso|love triangle/, 'triângulo amoroso'],
    [/plot twist|reviravolta/, 'plot twist'],
    [/narrador nao confiavel|narrador não confiável|narrador misterioso/, 'narrador misterioso'],
    [/enemies to lovers/, 'enemies to lovers'],
    [/friends to lovers/, 'friends to lovers'],
    [/slow burn/, 'slow burn'],
    [/crime|investigacao|investigação|detetive|serial killer/, 'mistério investigativo'],
    [/suspense|thriller/, 'suspense psicológico'],
    [/podcast|true crime/, 'true crime'],
    [/dark fantasy|fantasia sombria/, 'fantasia sombria'],
    [/romantasy/, 'romantasy'],
    [/distopia|dystopia/, 'distopia'],
    [/ficcao cientifica|ficção científica|science fiction|sci-fi/, 'ficção científica'],
    [/familia|família|segredos de familia|segredos de família/, 'segredos de família'],
    [/passado|trauma|luto/, 'passado traumático'],
    [/realeza|corte|principe|príncipe/, 'intriga de corte'],
    [/magia|feitic|feitiç|bruxa|deus|deuses/, 'sistema de magia']
  ];

  const tags = [];
  for (const [pattern, label] of checks) {
    if (pattern.test(pool)) tags.push(label);
  }
  return tags;
}

function makeLeanSynopsis(value = '') {
  const text = cleanText(value).replace(/<[^>]*>/g, ' ');
  if (!text) return '';

  const spoilerCue = /\b(final|finalmente|revela|revelado|revelação|descobre|descoberta|assassino|culpado|identidade|morre|morte de|desmascara|desmascaração|verdade por trás)\b/i;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => cleanText(s))
    .filter(Boolean);

  const safe = sentences.filter((s) => !spoilerCue.test(s));
  const picked = (safe.length ? safe : sentences).slice(0, 2).join(' ');
  return cleanText(picked).slice(0, 320);
}

function normalizeTags(values = []) {
  const seen = new Set();
  const tags = [];
  for (const item of values) {
    const tag = cleanText(item).toLowerCase();
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags.slice(0, 10);
}

function fallbackSection(genre = '') {
  if (genre === 'Thriller') return 'Thriller & Suspense Psicológico';
  if (genre === 'Romance Contemporâneo') return 'Romance Contemporâneo';
  if (genre === 'Fantasia' || genre === 'Romantasy' || genre === 'Ficção Científica' || genre === 'Distopia') return 'Fantasia';
  if (genre === 'Ficção Literária') return 'Ficção Literária';
  return 'Literatura Geral';
}

function coerceProfile(raw = {}, payload = {}, webEvidence = null) {
  const genre = ALLOWED_GENRES.includes(raw.genre) ? raw.genre : '';
  const baseSynopsis = makeLeanSynopsis(raw.synopsis || payload.synopsis || '');
  const aiTags = normalizeTags(Array.isArray(raw.tags) ? raw.tags : []);
  const inferredTags = normalizeTags(buildTropeTags(
    payload.categories || [],
    baseSynopsis || webEvidence?.description || '',
    genre || payload.genre || '',
    webEvidence?.subjects || []
  ));
  const tags = normalizeTags([...aiTags, ...inferredTags]);

  return {
    title: cleanText(raw.title || payload.title || ''),
    author: cleanText(raw.author || payload.author || ''),
    publisher: cleanText(raw.publisher || payload.publisher || ''),
    pages: Number(raw.pages || payload.pages || 0),
    synopsis: baseSynopsis,
    genre,
    sectionLabel: cleanText(raw.sectionLabel || fallbackSection(genre)),
    tags: tags.slice(0, 10)
  };
}

async function callOpenAiJson({ apiKey, model, systemPrompt, userPayload, temperature = 0.2 }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload) }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(cleanText(errorText) || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return safeParseJson(content);
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const payload = req.body || {};
  if (!payload.title && !payload.query) {
    res.status(400).json({ error: 'missing-title-or-query' });
    return;
  }

  const webEvidence = await collectWebEvidence(payload);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      ok: false,
      reason: 'OPENAI_API_KEY-not-configured',
      profile: null,
      webEvidence
    });
    return;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = [
    'Você organiza fichas de livros em português do Brasil.',
    'Responda apenas em JSON válido.',
    'A sinopse deve ser enxuta (1-2 frases), com gancho e sem spoilers.',
    'Nunca revele final, culpado, identidade secreta ou reviravolta completa.',
    'Use gênero apenas dentre: Fantasia, Romantasy, Ficção Científica, Thriller, Romance Contemporâneo, Ficção Literária, Distopia.',
    'Gere de 5 a 10 palavras-chave de tropos/atmosfera (ex.: triângulo amoroso, plot twist, narrador misterioso), sem spoiler, em minúsculas e sem hashtags.'
  ].join(' ');

  const userPrompt = {
    instruction: 'Organize os metadados deste livro no padrão de catálogo literário, usando também as evidências coletadas na web para sugerir tropos e palavras-chave mais precisas.',
    input: {
      title: payload.title || '',
      author: payload.author || '',
      synopsis: payload.synopsis || '',
      categories: Array.isArray(payload.categories) ? payload.categories : [],
      publisher: payload.publisher || '',
      pages: Number(payload.pages || 0),
      query: payload.query || '',
      webEvidence
    },
    output_schema: {
      title: 'string',
      author: 'string',
      publisher: 'string',
      pages: 'number',
      synopsis: 'string (1-2 frases curtas, sem spoiler)',
      genre: 'one of allowed genres',
      sectionLabel: 'string',
      tags: 'string[] (5-10 itens, tropos/estilo da história sem spoilers)'
    }
  };

  const tagSystemPrompt = [
    'Você é especialista em recomendar palavras-chave de livros em português do Brasil.',
    'Responda apenas em JSON válido.',
    'Sua tarefa é gerar somente palavras-chave de tropos, atmosfera, dinâmica e tipo de história.',
    'Evite temas genéricos demais e evite spoilers.',
    'Prefira expressões como: triângulo amoroso, plot twist, narrador misterioso, suspense psicológico, enemies to lovers, found family.',
    'Retorne entre 6 e 10 tags curtas, em minúsculas, sem hashtags.'
  ].join(' ');

  const tagPrompt = {
    instruction: 'Sugira palavras-chave literárias de alto valor para este livro com base nas evidências disponíveis na web e nos metadados.',
    input: {
      title: payload.title || '',
      author: payload.author || '',
      synopsis: payload.synopsis || '',
      categories: Array.isArray(payload.categories) ? payload.categories : [],
      webEvidence,
      examples_of_good_tags: [
        'triângulo amoroso',
        'plot twist',
        'narrador misterioso',
        'suspense psicológico',
        'slow burn',
        'mistério investigativo'
      ]
    },
    output_schema: {
      tags: 'string[] (6-10 itens, tropos/atmosfera sem spoilers)'
    }
  };

  try {
    const [parsed, tagParsed] = await Promise.all([
      callOpenAiJson({ apiKey, model, systemPrompt, userPayload: userPrompt, temperature: 0.2 }),
      callOpenAiJson({ apiKey, model, systemPrompt: tagSystemPrompt, userPayload: tagPrompt, temperature: 0.3 })
        .catch(() => null)
    ]);

    if (!parsed || typeof parsed !== 'object') {
      res.status(502).json({ ok: false, error: 'ai-invalid-json' });
      return;
    }

    const mergedProfile = {
      ...parsed,
      tags: normalizeTags([
        ...(Array.isArray(parsed?.tags) ? parsed.tags : []),
        ...(Array.isArray(tagParsed?.tags) ? tagParsed.tags : [])
      ])
    };

    res.status(200).json({ ok: true, profile: coerceProfile(mergedProfile, payload, webEvidence), webEvidence });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: 'ai-request-failed',
      details: error instanceof Error ? error.message : 'unknown-error'
    });
  }
}
