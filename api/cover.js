const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function htmlDecode(input = '') {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeUrl(url = '') {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice(7)}`;
  if (trimmed.startsWith('https://')) return trimmed;
  return '';
}

function pickLikelyCoverUrl(urls = []) {
  const filtered = urls
    .map(normalizeUrl)
    .filter(Boolean)
    .filter((url) => !/sprite|avatar|icon|logo|banner|pixel|transparent/i.test(url));

  if (filtered.length === 0) return '';
  const preferred = filtered.find((url) => /cover|capa|book|livro|images-na|m\.media-amazon|gr-assets/i.test(url));
  return preferred || filtered[0];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/json;q=0.9,*/*;q=0.8'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function resolveGoodreadsCover(title, author) {
  const q = `${title} ${author}`.trim();
  if (!q) return '';

  try {
    const autoUrl = `https://www.goodreads.com/book/auto_complete?format=json&q=${encodeURIComponent(q)}`;
    const res = await fetch(autoUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json,text/plain,*/*'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const candidates = data
          .map((entry) => entry?.imageUrl || entry?.image_url || '')
          .filter(Boolean);
        const picked = pickLikelyCoverUrl(candidates);
        if (picked) return picked;
      }
    }
  } catch {
    // Continue with HTML fallback.
  }

  const searchUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(q)}`;
  const html = await fetchText(searchUrl);

  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return normalizeUrl(htmlDecode(og[1]));

  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  return pickLikelyCoverUrl(imgMatches);
}

async function resolveSkoobCover(title, author) {
  const q = `${title} ${author}`.trim();
  if (!q) return '';

  const searchUrl = `https://www.skoob.com.br/livro/lista/?q=${encodeURIComponent(q)}`;
  const html = await fetchText(searchUrl);

  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return normalizeUrl(htmlDecode(og[1]));

  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  return pickLikelyCoverUrl(imgMatches);
}

async function fetchImage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: 'https://www.google.com/'
    }
  });

  if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return { contentType, bytes: Buffer.from(arrayBuffer) };
}

export default async function handler(req, res) {
  try {
    setCors(res);

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const source = String(req.query?.source || '').toLowerCase();
    const title = String(req.query?.title || '').trim();
    const author = String(req.query?.author || '').trim();

    if (!title) {
      res.status(400).json({ error: 'title-required' });
      return;
    }

    let coverUrl = '';
    if (source === 'goodreads') {
      coverUrl = await resolveGoodreadsCover(title, author);
    } else if (source === 'skoob') {
      coverUrl = await resolveSkoobCover(title, author);
    } else {
      res.status(400).json({ error: 'invalid-source', supported: ['goodreads', 'skoob'] });
      return;
    }

    if (!coverUrl) {
      res.status(404).json({ error: 'cover-not-found', source, title, author });
      return;
    }

    const image = await fetchImage(coverUrl);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', image.contentType);
    res.status(200).send(image.bytes);
  } catch (error) {
    res.status(502).json({
      error: 'proxy-failed',
      message: error instanceof Error ? error.message : 'unknown-error'
    });
  }
}
