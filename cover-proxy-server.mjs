import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.COVER_PROXY_PORT || 8787);
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
  const trimmed = (url || '').trim();
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

  // Goodreads autocomplete frequently returns image URLs directly.
  const autoUrl = `https://www.goodreads.com/book/auto_complete?format=json&q=${encodeURIComponent(q)}`;
  try {
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
    // Best effort fallback below.
  }

  // Fallback: parse search HTML for og:image or first likely img.
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

const server = createServer(async (req, res) => {
  try {
    setCors(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, service: 'cover-proxy', port: PORT }));
      return;
    }

    if (url.pathname !== '/cover') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'not-found' }));
      return;
    }

    const source = (url.searchParams.get('source') || '').toLowerCase();
    const title = (url.searchParams.get('title') || '').trim();
    const author = (url.searchParams.get('author') || '').trim();

    if (!title) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'title-required' }));
      return;
    }

    let coverUrl = '';
    if (source === 'goodreads') {
      coverUrl = await resolveGoodreadsCover(title, author);
    } else if (source === 'skoob') {
      coverUrl = await resolveSkoobCover(title, author);
    } else {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'invalid-source', supported: ['goodreads', 'skoob'] }));
      return;
    }

    if (!coverUrl) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'cover-not-found', source, title, author }));
      return;
    }

    const image = await fetchImage(coverUrl);
    res.statusCode = 200;
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(image.bytes);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: 'proxy-failed',
        message: error instanceof Error ? error.message : 'unknown-error'
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Cover proxy online: http://localhost:${PORT}`);
  console.log('Endpoints: /health, /cover?source=goodreads|skoob&title=...&author=...');
});
