// Vercel function for the volunteer API. vercel.json rewrites /api/v1/<path> here with the
// path in ?__path=; the routes themselves live in backend/volunteers/.
import { handleVolunteerApi } from '../backend/volunteers/api.js';

function routePath(req, url) {
  const fromQuery = req.query?.__path ?? url.searchParams.get('__path');
  const value = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  if (typeof value === 'string' && !value.startsWith(':')) return `/${value}`;
  // Without the rewrite (e.g. a direct call to /api/v1) fall back to the URL itself.
  return url.pathname.replace(/^\/api\/v1/, '') || '/';
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = routePath(req, url);
  url.searchParams.delete('__path');

  let body;
  let bodyError = false;
  try {
    body = req.body; // Vercel parses JSON lazily and throws here if it is malformed.
  } catch {
    bodyError = true;
  }

  const result = await handleVolunteerApi({
    method: req.method,
    path,
    query: url.searchParams,
    headers: req.headers,
    body,
    bodyError,
    ip: String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || null,
  });

  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value);
  res.statusCode = result.status;
  res.end(result.body === null ? undefined : JSON.stringify(result.body));
}
