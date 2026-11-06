// Settings for the volunteer API. Secrets and service credentials come from environment
// variables (see .env.example); the fixed rules (OTP limits, token lifetimes, minimum age)
// are the constants in LIMITS.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

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
    // Signs login tokens and keys the OTP/Aadhaar hashes. Local runs get a fixed dev value.
    appSecret: env.APP_SECRET || (production ? null : 'local-dev-secret-not-for-production'),
    adminApiKey: env.ADMIN_API_KEY || (production ? null : 'dev-admin-key'),
    // Dev mode returns the OTP in the API response instead of sending an SMS. It is on by
    // default locally when Twilio isn't set up; in production it has to be switched on.
    otpDevMode: env.OTP_DEV_MODE ? env.OTP_DEV_MODE === 'true' : !production && !twilio,
    twilio,
    redis: redisUrl && redisToken ? { url: redisUrl.replace(/\/+$/, ''), token: redisToken } : null,
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
