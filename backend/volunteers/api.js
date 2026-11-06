// The volunteer API (mounted at /api/v1): phone-OTP sign-in, Aadhaar-backed registration,
// events by city, applications, coordinator ratings and the ranking built from them.
//
// handle() takes a plain request ({ method, path, query, headers, body, ip }) and returns
// { status, headers, body }, so server.mjs (local) and api/v1.js (Vercel) share it.
import { configProblem, loadConfig } from './config.js';
import { createStore } from './store.js';
import { twilioSender } from './otp.js';
import { verifyToken } from './tokens.js';
import { createService } from './service.js';
import { HttpError, badRequest } from './validate.js';
import { commonRoutes } from './routes-common.js';
import { volunteerRoutes } from './routes-volunteer.js';
import { adminRoutes } from './routes-admin.js';
import { seedDemoEvents } from './demo-events.js';

export const API_PREFIX = '/api/v1';

export function createVolunteerApi(options = {}) {
  const config = options.config ?? loadConfig();
  const svc = createService({
    config,
    store: options.store ?? createStore(config),
    sendSms: options.sendSms !== undefined ? options.sendSms : config.twilio ? twilioSender(config.twilio) : null,
    now: options.now ?? (() => new Date()),
  });

  const routes = [];
  // auth: 'none' | 'registration' | 'volunteer' | 'admin' | 'any' (volunteer or admin)
  // open: works even when the server secrets aren't configured yet.
  function define(method, pattern, { auth = 'none', open = false, status = 200, summary = '' }, handler) {
    const keys = [];
    const source = pattern.replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    routes.push({ method, pattern, auth, open, status, summary, keys, regex: new RegExp(`^${source}$`), handler });
  }

  define('GET', '/', { open: true, summary: 'This list of endpoints' }, () => ({
    name: 'Newbi volunteer API',
    docs: 'docs/volunteer-api.md in the repository',
    endpoints: routes.map((r) => ({ method: r.method, path: API_PREFIX + (r.pattern === '/' ? '' : r.pattern), auth: r.auth, summary: r.summary })),
  }));
  commonRoutes(define, svc);
  volunteerRoutes(define, svc);
  adminRoutes(define, svc);

  async function authenticate(mode, headers) {
    if (mode === 'none') return null;
    const match = /^Bearer\s+(\S+)$/i.exec(headers.authorization ?? '');
    const payload = match && verifyToken(match[1], config.appSecret, svc.nowMs());
    if (!payload) throw new HttpError(401, 'unauthorized', 'Missing, invalid or expired token. Sign in again.');

    const allowed = mode === 'any' ? ['volunteer', 'admin'] : [mode];
    if (!allowed.includes(payload.role)) {
      const need = { registration: 'a registration token from /auth/verify-otp', volunteer: 'a volunteer token', admin: 'an admin token' };
      throw new HttpError(403, 'forbidden', `This endpoint needs ${mode === 'any' ? 'a volunteer or admin token' : need[mode]}.`);
    }
    if (payload.role === 'registration') return { role: 'registration', phone: payload.phone };
    if (payload.role === 'admin') return { role: 'admin', admin: { name: payload.name } };

    const volunteer = await svc.db.get('volunteers', payload.sub);
    if (!volunteer) throw new HttpError(401, 'unauthorized', 'This account no longer exists.');
    if (volunteer.status === 'suspended') {
      throw new HttpError(403, 'account_suspended', 'This volunteer account is suspended. Contact the coordination team.');
    }
    return { role: 'volunteer', volunteer };
  }

  const baseHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Prototype demo events: checked once per server instance, before the first request.
  let demoSeeding = null;
  function ensureDemoEvents() {
    if (!config.seedDemoEvents) return null;
    demoSeeding ??= seedDemoEvents(svc).catch((err) => {
      console.error('[volunteer-api] seeding demo events failed:', err);
      demoSeeding = null; // try again on the next request
    });
    return demoSeeding;
  }

  async function handle(req) {
    const headers = { ...baseHeaders };
    if (req.method === 'OPTIONS') return { status: 204, headers, body: null };
    try {
      await ensureDemoEvents();
      const path = `/${String(req.path ?? '').replace(/^\/+|\/+$/g, '')}`;
      const candidates = routes.filter((r) => r.regex.test(path));
      if (!candidates.length) {
        throw new HttpError(404, 'not_found', `No endpoint at ${API_PREFIX}${path === '/' ? '' : path}. GET ${API_PREFIX} lists them all.`);
      }
      const route = candidates.find((r) => r.method === req.method);
      if (!route) {
        const methods = [...new Set(candidates.map((r) => r.method))].join(', ');
        throw new HttpError(405, 'method_not_allowed', `${API_PREFIX}${path} accepts ${methods}.`);
      }

      const match = route.regex.exec(path);
      let params;
      try {
        params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
      } catch {
        throw badRequest('invalid_path', 'The URL is malformed.');
      }
      const problem = !route.open && configProblem(config);
      if (problem) throw new HttpError(503, 'not_configured', problem);

      const auth = await authenticate(route.auth, req.headers ?? {});
      const body = ['POST', 'PATCH'].includes(req.method) ? parseBody(req.body, req.bodyError) : {};
      const query = req.query instanceof URLSearchParams ? req.query : new URLSearchParams(req.query ?? {});
      const data = await route.handler({ params, query, body, auth, ip: req.ip ?? null });
      return { status: route.status, headers, body: { success: true, ...data } };
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.details?.retryAfterSeconds) headers['Retry-After'] = String(err.details.retryAfterSeconds);
        return {
          status: err.status,
          headers,
          body: { success: false, error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) } },
        };
      }
      console.error('[volunteer-api]', err);
      return { status: 500, headers, body: { success: false, error: { code: 'server_error', message: 'Something went wrong. Try again.' } } };
    }
  }

  return { handle, routes, svc };
}

// Accepts an already-parsed object (Vercel), a raw string or Buffer (local server), or nothing.
function parseBody(raw, bodyError) {
  const invalidJson = () => badRequest('invalid_json', 'The request body must be valid JSON.');
  if (bodyError) throw invalidJson();
  let body = Buffer.isBuffer(raw) ? raw.toString('utf8') : raw;
  if (typeof body === 'string') {
    if (!body.trim()) return {};
    try {
      body = JSON.parse(body);
    } catch {
      throw invalidJson();
    }
  }
  if (body === undefined || body === null) return {};
  if (typeof body !== 'object' || Array.isArray(body)) throw badRequest('invalid_body', 'The request body must be a JSON object.');
  return body;
}

let defaultApi;
export function handleVolunteerApi(req) {
  defaultApi ??= createVolunteerApi();
  return defaultApi.handle(req);
}
