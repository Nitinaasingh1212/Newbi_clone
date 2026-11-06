// Signed tokens (HS256 JWTs) and keyed hashes, built on node:crypto.
import { createHmac, timingSafeEqual } from 'node:crypto';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const HEADER = encode({ alg: 'HS256', typ: 'JWT' });

export function signToken(payload, secret, ttlSeconds, nowMs = Date.now()) {
  const iat = Math.floor(nowMs / 1000);
  const unsigned = `${HEADER}.${encode({ ...payload, iat, exp: iat + ttlSeconds })}`;
  return `${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`;
}

// Returns the payload, or null if the token is malformed, tampered with or expired.
export function verifyToken(token, secret, nowMs = Date.now()) {
  const parts = String(token).split('.');
  if (parts.length !== 3 || parts[0] !== HEADER) return null;
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  const given = Buffer.from(parts[2], 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload?.exp !== 'number' || payload.exp * 1000 <= nowMs) return null;
  return payload;
}

// HMAC of a value, namespaced by purpose. Used for OTPs and Aadhaar numbers so the stored
// hash can't be reversed by brute force without the server secret.
export function keyedHash(secret, purpose, value) {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
