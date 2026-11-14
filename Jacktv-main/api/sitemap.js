// Vercel serverless function: GET /sitemap.xml
// Uses TMDB_API_KEY (server-side, no VITE_ prefix) or falls back to VITE_TMDB_API_KEY
const API_KEY = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = process.env.SITE_URL || 'https://GANTI-DOMAIN-VERCEL';
const SUPPORTED_LANGS = ['en', 'id', 'fr', 'ja', 'ko', 'de', 'es', 'it', 'pt', 'hu'];

function slugify(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
    .replace(/-+$/, '');
}

function buildUrl(lang, type, id, title, originalTitle = '') {
  let slug = slugify(title);
  if (!slug) slug = slugify(originalTitle);
  return slug ? `/${lang}/${type}/${id}-${slug}` : `/${lang}/${type}/${id}`;
}

async function fetchTmdb(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status}`);
  return res.json();
}

async function collectItems(type, pages = 3) {
  const items = [];
  for (let page = 1; page <= pages; page++) {
    try {
      const [trending, popular] = await Promise.all([
        fetchTmdb(`/trending/${type}/week`, { page }),
        fetchTmdb(`/${type}/popular`, { page })
      ]);
      items.push(...(trending.results || []), ...(popular.results || []));
    } catch (e) {
      console.error(e);
    }
  }
  // Deduplicate by id
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default async function handler(req, res) {
  try {
    const [movies, tvs] = await Promise.all([
      collectItems('movie', 3),
      collectItems('tv', 3)
    ]);

    const today = new Date().toISOString().split('T')[0];
    const allItems = [
      ...movies.map(m => ({ ...m, mediaType: 'movie' })),
      ...tvs.map(t => ({ ...t, mediaType: 'tv' }))
    ];

    const urls = [];

    // Homepage
    for (const l of SUPPORTED_LANGS) {
      const hreflang = l === 'en' ? 'en' : l === 'zh' ? 'zh-CN' : l === 'pt' ? 'pt-BR' : l;
      urls.push(`
  <url>
    <loc>${SITE_URL}/?lang=${l}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${l === 'en' ? '1.0' : '0.8'}</priority>
  </url>`);
    }

    // Detail pages
    for (const item of allItems) {
      const enTitle = item.title || item.name || '';
      const origTitle = item.original_title || item.original_name || '';
      const enUrl = buildUrl('en', item.mediaType, item.id, enTitle, origTitle);
      const lastmod = (item.release_date || item.first_air_date || today).substring(0, 10);

      const alternates = SUPPORTED_LANGS.map(l => {
        const altUrl = buildUrl(l, item.mediaType, item.id, enTitle, origTitle);
        const hreflang = l === 'en' ? 'en' : l === 'zh' ? 'zh-CN' : l === 'pt' ? 'pt-BR' : l;
        return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${SITE_URL}${altUrl}"/>`;
      }).join('\n');

      urls.push(`
  <url>
    <loc>${SITE_URL}${enUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${enUrl}"/>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
}
