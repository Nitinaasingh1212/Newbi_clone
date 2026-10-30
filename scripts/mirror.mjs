// Mirrors the newbi.live landing site into ./site so it can be served locally.
// Usage: node scripts/mirror.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://www.newbi.live';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const CONCURRENCY = 8;

const PAGES = ['/', '/creator', '/contact', '/terms', '/privacy', '/work', '/concertzone'];
const EXTRA = [
  '/index.html', '/robots.txt', '/sitemap.xml', '/site.webmanifest', '/manifest.webmanifest',
  '/api/forms?type=public-feed', '/api/forms?type=public-archive',
];
const ASSET_EXT = /\.(js|mjs|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|json|xml|txt|webmanifest|mp4|webm|avif)$/i;

const queue = [...PAGES, ...EXTRA];
const seen = new Set();
const failed = [];

function enqueue(ref, base) {
  if (!ref || /^(data:|#|mailto:|tel:|javascript:)/.test(ref)) return;
  let url;
  try { url = new URL(ref, ORIGIN + base); } catch { return; }
  if (url.origin !== ORIGIN) return;
  const p = url.pathname + (url.pathname.startsWith('/api/') ? url.search : '');
  if (!seen.has(p) && !queue.includes(p)) queue.push(p);
}

// Pull same-origin references out of HTML, CSS and JS.
function scan(text, base, type) {
  const refs = new Set();
  if (type === 'html') {
    for (const m of text.matchAll(/(?:src|href|content|poster)=["']([^"']+)["']/g)) refs.add(m[1]);
    for (const m of text.matchAll(/srcset=["']([^"']+)["']/g))
      for (const part of m[1].split(',')) refs.add(part.trim().split(/\s+/)[0]);
  }
  if (type === 'css' || type === 'html') {
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) refs.add(m[1]);
  }
  if (type === 'js') {
    // Relative chunk imports ("./HomePage-xxx.js") and absolute public paths ("/brand/x.png").
    for (const m of text.matchAll(/["'`](\.{1,2}\/[\w.\-\/]+\.(?:js|mjs|css))["'`]/g)) refs.add(m[1]);
    for (const m of text.matchAll(/["'`](\/[\w.\-\/]+)["'`]/g)) if (ASSET_EXT.test(m[1])) refs.add(m[1]);
    for (const m of text.matchAll(/["'`](assets\/[\w.\-\/]+)["'`]/g)) if (ASSET_EXT.test(m[1])) refs.add('/' + m[1]);
  }
  for (const r of refs) {
    if (type === 'html' && !/^(\/|\.|https:\/\/www\.newbi\.live)/.test(r)) continue;
    // From HTML, only follow route-like paths for the pages we asked for; follow every asset.
    if (type === 'html' && !ASSET_EXT.test(r.split('?')[0])) continue;
    enqueue(r, base);
  }
}

function fileFor(path, isHtml) {
  // API responses are stored per query type, e.g. api/forms.public-feed.json (see server.mjs).
  if (path.startsWith('/api/forms')) {
    const type = new URLSearchParams(path.split('?')[1] || '').get('type') || 'default';
    return join(OUT, 'api', `forms.${type}.json`);
  }
  const clean = decodeURIComponent(path.split('?')[0]);
  if (isHtml && !/\.html?$/.test(clean)) return join(OUT, clean, 'index.html');
  return join(OUT, clean);
}

async function crawl(path) {
  const res = await fetch(ORIGIN + path, { headers: { 'User-Agent': UA }, redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    console.log(`skip ${path} (redirect -> ${res.headers.get('location')})`);
    return;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  const buf = Buffer.from(await res.arrayBuffer());
  const isHtml = ct.includes('text/html');
  // An asset URL answered with HTML is the SPA fallback, not a real file.
  if (isHtml && ASSET_EXT.test(path.split('?')[0]) && !path.endsWith('.html')) throw new Error('got html fallback');

  const file = fileFor(path, isHtml && !path.startsWith('/api/'));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
  console.log(`ok   ${path}  (${buf.length} B)`);

  const base = isHtml ? (path.endsWith('/') ? path : path + '/') : posix.dirname(path.split('?')[0]) + '/';
  if (isHtml) scan(buf.toString('utf8'), base, 'html');
  else if (ct.includes('css') || path.endsWith('.css')) scan(buf.toString('utf8'), base, 'css');
  else if (ct.includes('javascript') || /\.m?js$/.test(path)) scan(buf.toString('utf8'), base, 'js');
}

async function main() {
  let inFlight = 0;
  await new Promise((resolve) => {
    const pump = () => {
      while (inFlight < CONCURRENCY && queue.length) {
        const path = queue.shift();
        if (seen.has(path)) continue;
        seen.add(path);
        inFlight++;
        crawl(path)
          .catch((e) => failed.push(`${path} (${e.message})`))
          .finally(() => { inFlight--; pump(); });
      }
      if (!inFlight && !queue.length) resolve();
    };
    pump();
  });
  console.log(`\nDone: ${seen.size} paths visited, ${failed.length} failed`);
  for (const f of failed) console.log('  fail', f);
}

main();
