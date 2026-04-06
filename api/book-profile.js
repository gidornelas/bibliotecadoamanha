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
  const picked = (safe.length ? safe : sentences).slice(0, 5).join(' ');
  return cleanText(picked).slice(0, 800);
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

const GENERIC_TAG_BLOCKLIST = new Set([
  'fiction',
  'ficcao',
  'ficção',
  'romance',
  'livro',
  'book',
  'novel',
  'literatura',
  'autor',
  'autora',
  'escritor',
  'escritora',
  'volume',
  'serie',
  'série',
  'drama'
]);

const NOISE_STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma',
  'para', 'por', 'com', 'sem', 'ao', 'aos', 'à', 'às', 'the', 'of', 'and'
]);

function normalizeKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildNoiseTokenSet(title = '', author = '') {
  const tokens = new Set();
  const source = `${title || ''} ${author || ''}`;
  normalizeKey(source)
    .split(' ')
    .map((v) => v.trim())
    .filter((v) => v.length >= 3 && !NOISE_STOPWORDS.has(v))
    .forEach((v) => tokens.add(v));
  return tokens;
}

function sanitizeStoryTags(values = [], title = '', author = '') {
  const tokens = buildNoiseTokenSet(title, author);
  const out = [];
  const seen = new Set();

  for (const raw of values) {
    const tag = cleanText(raw).toLowerCase();
    if (!tag) continue;

    const key = normalizeKey(tag);
    if (!key || seen.has(key)) continue;
    if (GENERIC_TAG_BLOCKLIST.has(key)) continue;
    if (tokens.has(key)) continue;

    const words = key.split(' ').filter(Boolean);
    if (!words.length) continue;

    const allNoise = words.every((word) => tokens.has(word) || NOISE_STOPWORDS.has(word));
    if (allNoise) continue;

    const hasMeaningfulWord = words.some((word) => word.length >= 4 && !NOISE_STOPWORDS.has(word));
    if (!hasMeaningfulWord) continue;

    seen.add(key);
    out.push(tag);
    if (out.length >= 10) break;
  }

  return out;
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
  const rawSynopsis = cleanText(raw.synopsis || '');
  const baseSynopsis = rawSynopsis || makeLeanSynopsis(payload.synopsis || '');
  const resolvedTitle = cleanText(raw.title || payload.title || '');
  const resolvedAuthor = cleanText(raw.author || payload.author || '');
  const aiTags = normalizeTags(Array.isArray(raw.tags) ? raw.tags : []);
  const combinedSignals = normalizeTags([
    ...(Array.isArray(payload.categories) ? payload.categories : []),
    ...(Array.isArray(webEvidence?.subjects) ? webEvidence.subjects : [])
  ]);
  const inferredTags = normalizeTags(buildTropeTags(
    combinedSignals,
    baseSynopsis || webEvidence?.description || '',
    genre || payload.genre || '',
    webEvidence?.subjects || []
  ));
  const tags = sanitizeStoryTags([...aiTags, ...inferredTags], resolvedTitle, resolvedAuthor);

  return {
    title: resolvedTitle,
    author: resolvedAuthor,
    publisher: cleanText(raw.publisher || payload.publisher || ''),
    pages: Number(raw.pages || payload.pages || 0),
    synopsis: baseSynopsis,
    genre,
    sectionLabel: cleanText(raw.sectionLabel || fallbackSection(genre)),
    tags: tags.slice(0, 10)
  };
}

async function callAnthropicJson({ apiKey, model, systemPrompt, userPayload, temperature = 0.2 }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: JSON.stringify(userPayload) }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(cleanText(errorText) || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text || '';
  return safeParseJson(content);
}

async function callAiJson({ systemPrompt, userPayload, temperature = 0.2 }) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (anthropicKey) {
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    return callAnthropicJson({ apiKey: anthropicKey, model, systemPrompt, userPayload, temperature });
  }

  if (openaiKey) {
    return callOpenAiJson({ apiKey: openaiKey, model: process.env.OPENAI_MODEL || 'gpt-4o-mini', systemPrompt, userPayload, temperature });
  }

  return null;
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

  const hasAiKey = !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
  if (!hasAiKey) {
    res.status(200).json({
      ok: false,
      reason: 'AI_API_KEY-not-configured',
      profile: null,
      webEvidence
    });
    return;
  }

  const systemPrompt = [
    'Você é um curador profissional de fichas de livros em português do Brasil.',
    'Responda APENAS em JSON válido, sem markdown, sem comentários.',
    '',
    'SINOPSE (campo "synopsis"):',
    '- Escreva de 3 a 5 frases cativantes, na terceira pessoa.',
    '- Apresente o protagonista, o conflito central e o gancho que prende o leitor.',
    '- NUNCA revele finais, culpados, identidades secretas ou reviravoltas completas.',
    '- NUNCA use frases como "este livro conta a história" — vá direto à ação.',
    '- Exemplo de tom: "Lowen Ashleigh é uma escritora falida que aceita um trabalho irrecusável: terminar a série de livros da autora best-seller Verity Crawford. Ao se instalar na casa da família, encontra um manuscrito autobiográfico escondido — e as revelações são perturbadoras."',
    '',
    'TAGS (campo "tags"):',
    '- Gere de 6 a 10 palavras-chave de tropos, dinâmicas e atmosfera da história.',
    '- Exemplos válidos: thriller psicológico, narrador não confiável, plot twist, enemies to lovers, slow burn, dual POV, found family, triângulo amoroso, segredos de família, passado e presente, suspense gótico, romance proibido, manuscrito secreto, obsessão, stalking, casa com história, baseado em fato real.',
    '- NUNCA use nomes do autor, personagens, título, editora ou termos genéricos sozinhos (fiction, livro, romance, drama).',
    '- Tags em minúsculas, sem hashtags.',
    '',
    'GÊNERO (campo "genre"):',
    '- Use exatamente um destes valores: Fantasia, Romantasy, Ficção Científica, Thriller, Romance Contemporâneo, Ficção Literária, Distopia.',
    '',
    'DEMAIS CAMPOS: title, author, publisher (editora brasileira se possível), pages (número real de páginas da edição brasileira).',
    'Campo "sectionLabel": use a seção temática do catálogo (ex: "Thriller & Suspense Psicológico", "Romance Contemporâneo", "Fantasia Épica", "Romantasy", "Ficção Científica").',
    'Campo "isSeries" (boolean), "series" (nome da série), "volume" (número), "totalVolumes" (total).'
  ].join('\n');

  const userPrompt = {
    instruction: 'Organize os metadados deste livro para um catálogo literário brasileiro. Use todo o seu conhecimento sobre este livro, além das evidências web fornecidas. A sinopse deve ter 3-5 frases com gancho e sem spoilers. As tags devem descrever tropos, dinâmicas e atmosfera.',
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
      publisher: 'string (editora brasileira)',
      pages: 'number',
      synopsis: 'string (3-5 frases, sem spoiler, tom cativante)',
      genre: 'one of: Fantasia, Romantasy, Ficção Científica, Thriller, Romance Contemporâneo, Ficção Literária, Distopia',
      sectionLabel: 'string (seção temática do catálogo)',
      tags: 'string[] (6-10 itens: tropos, atmosfera, dinâmicas)',
      isSeries: 'boolean',
      series: 'string (nome da série, se aplicável)',
      volume: 'number (0 se não for série)',
      totalVolumes: 'number (0 se não for série)'
    }
  };

  try {
    const parsed = await callAiJson({ systemPrompt, userPayload: userPrompt, temperature: 0.3 });

    if (!parsed || typeof parsed !== 'object') {
      res.status(502).json({ ok: false, error: 'ai-invalid-json' });
      return;
    }

    const profile = coerceProfile(parsed, payload, webEvidence);

    // Merge series info from AI response
    if (parsed.isSeries) {
      profile.isSeries = true;
      profile.series = cleanText(parsed.series || '');
      profile.volume = Number(parsed.volume) || 0;
      profile.totalVolumes = Number(parsed.totalVolumes) || 0;
    }

    res.status(200).json({ ok: true, profile, webEvidence });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: 'ai-request-failed',
      details: error instanceof Error ? error.message : 'unknown-error'
    });
  }
}
