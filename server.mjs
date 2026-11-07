// Local server for the OSH Entertainment site (./site) and its API (/api/v1).
// Usage: node server.mjs   (PORT env var optional, default 3000)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleVolunteerApi } from './backend/volunteers/api.js';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'site');
const PORT = Number(process.env.PORT) || 3000;

// Pages with an id in the path. vercel.json has the same rewrites.
const REWRITES = [
  [/^\/events\/[^/]+\/?$/, 'events/event.html'],
];

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
  '.md': 'text/markdown; charset=utf-8',
};

async function isFile(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

async function send(res, file, status = 200) {
  const body = await readFile(file);
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// The API (backend/volunteers), the same code the Vercel function in api/v1.js runs.
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
    const target = normalize(join(ROOT, path));
    if (!target.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

    if (await isFile(target)) return await send(res, target);
    if (await isFile(join(target, 'index.html'))) return await send(res, join(target, 'index.html'));
    for (const [pattern, file] of REWRITES) if (pattern.test(path)) return await send(res, join(ROOT, file));
    return await send(res, join(ROOT, '404.html'), 404);
  } catch (e) {
    if (e instanceof URIError) { res.writeHead(400); return res.end('Bad request'); }
    console.error(e);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => console.log(`OSH Entertainment running at http://localhost:${PORT}`));
