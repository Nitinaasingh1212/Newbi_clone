// Settings for the volunteer API. Secrets and service credentials come from environment
// variables (see .env.example); the fixed rules (OTP limits, token lifetimes, minimum age)
// are the constants in LIMITS.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

// PROTOTYPE SETTINGS: hardcoded so the deployed prototype works with no Vercel setup.
// This repository is public, so anyone can read these values and use them to sign in as an
// admin or forge login tokens. Before real volunteers use the app, set APP_SECRET and
// ADMIN_API_KEY (and Twilio for SMS) as Vercel environment variables. Those override
// everything here, so no code change is needed.
export const PROTOTYPE = {
  appSecret: 'dbba0e17c020bb360b32e2bfb2dac8470a63a32b269ee4ade43653fba8d55ec8',
  adminApiKey: 'newbi-admin-2026',
  // Demo events, demo volunteers for the leaderboard, and a demo account anyone can sign in
  // as: phone 99999 99999, OTP 123456 (see demo-data.js).
  demoMode: true,
};

export const LIMITS = {
  otpTtlSeconds: 5 * 60,
  otpResendSeconds: 30,
  otpMaxSendsPerHour: 5, // per phone number
  otpMaxSendsPerIpPerHour: 30,
  otpMaxAttempts: 5, // wrong guesses before the code is thrown away
  registrationTokenSeconds: 15 * 60,
  volunteerTokenSeconds: 30 * 24 * 60 * 60,
  adminTokenSeconds: 12 * 60 * 60,
  adminLoginAttemptsPer15Min: 10, // per IP
  minVolunteerAge: 18,
  timeZone: 'Asia/Kolkata', // decides what "today" is for event dates
};

export function loadConfig(env = process.env) {
  const onVercel = Boolean(env.VERCEL);
  const production = onVercel || env.NODE_ENV === 'production';
  const redisUrl = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const redisToken = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  const twilio =
    env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER
      ? { accountSid: env.TWILIO_ACCOUNT_SID, authToken: env.TWILIO_AUTH_TOKEN, from: env.TWILIO_FROM_NUMBER }
      : null;

  return {
    production,
    onVercel,
    // Signs login tokens and keys the OTP/Aadhaar hashes.
    appSecret: env.APP_SECRET || PROTOTYPE.appSecret,
    adminApiKey: env.ADMIN_API_KEY || PROTOTYPE.adminApiKey,
    usingPrototypeSecrets: !env.APP_SECRET || !env.ADMIN_API_KEY,
    // Dev mode returns the OTP in the API response instead of sending an SMS. It stays on
    // until Twilio is configured, unless OTP_DEV_MODE says otherwise.
    otpDevMode: env.OTP_DEV_MODE ? env.OTP_DEV_MODE === 'true' : !twilio,
    demoMode: env.DEMO_MODE ? env.DEMO_MODE === 'true' : PROTOTYPE.demoMode,
    twilio,
    redis: redisUrl && redisToken ? { url: redisUrl.replace(/\/+$/, ''), token: redisToken } : null,
    // Local runs keep data in SQLite. Not on Vercel: each copy of the function there has
    // its own disk, so a file database can't be shared between them (use Redis instead).
    sqliteFile: env.SQLITE_FILE || (onVercel ? null : join(PROJECT_ROOT, 'data', 'newbi.sqlite')),
    // Fallback when neither Redis nor SQLite is available.
    dbFile:
      env.VOLUNTEER_DB_FILE ||
      (onVercel ? '/tmp/volunteer-db.json' : join(PROJECT_ROOT, 'data', 'volunteer-db.json')),
    corsOrigin: env.CORS_ORIGIN || '*',
  };
}

// Returns why the API can't issue or check tokens, or null when it can.
export function configProblem(config) {
  if (!config.appSecret) return 'APP_SECRET is not set on the server.';
  if (config.production && config.appSecret.length < 32) return 'APP_SECRET must be at least 32 characters.';
  return null;
}
