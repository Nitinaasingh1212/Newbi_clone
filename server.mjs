// Local static server for the mirrored site in ./site.
// Usage: node server.mjs   (PORT env var optional, default 3000)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleVolunteerApi } from './backend/volunteers/api.js';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'site');
const PORT = Number(process.env.PORT) || 3000;
// Routes the landing site doesn't prerender are handled by the app shell.
const APP_SHELL = join(ROOT, 'concertzone', 'index.html');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
};

async function isFile(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

async function send(res, file, status = 200) {
  const body = await readFile(file);
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const cache = file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache';
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': cache });
  res.end(body);
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function handleApi(req, res, url) {
  const type = url.searchParams.get('type') || '';
  if (req.method === 'POST') {
    // Form submissions stay local: log them instead of forwarding to the real site.
    let body = '';
    for await (const chunk of req) body += chunk;
    console.log(`[form:${type}]`, body);
    return json(res, 200, { success: true });
  }
  const file = join(ROOT, 'api', `forms.${type.replace(/[^\w-]/g, '')}.json`);
  if (await isFile(file)) return send(res, file);
  return json(res, 200, { success: true, items: [] });
}

// Volunteer API (backend/volunteers), the same code the Vercel function in api/v1.js runs.
async function handleV1(req, res, url) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) return json(res, 413, { success: false, error: { code: 'too_large', message: 'Request body is too large.' } });
    chunks.push(chunk);
  }
  const result = await handleVolunteerApi({
    method: req.method,
    path: url.pathname.slice('/api/v1'.length),
    query: url.searchParams,
    headers: req.headers,
    body: Buffer.concat(chunks),
    ip: req.socket.remoteAddress,
  });
  res.writeHead(result.status, result.headers);
  res.end(result.body === null ? undefined : JSON.stringify(result.body));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) return await handleV1(req, res, url);

    const path = decodeURIComponent(url.pathname);

    if (path.startsWith('/api/forms')) return await handleApi(req, res, url);
    // Vercel analytics beacons have nowhere to go locally.
    if (path.startsWith('/_vercel/') && req.method !== 'GET') { res.writeHead(204); return res.end(); }

    const target = normalize(join(ROOT, path));
    if (!target.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

    if (await isFile(target)) return await send(res, target);
    if (await isFile(join(target, 'index.html'))) return await send(res, join(target, 'index.html'));
    if (!extname(path)) return await send(res, APP_SHELL);

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => console.log(`newbi.live clone running at http://localhost:${PORT}`));
