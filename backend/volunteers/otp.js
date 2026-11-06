// Phone OTPs: 6-digit codes, stored only as a keyed hash, valid for 5 minutes, with resend
// cooldown, per-number and per-IP send limits, and a cap on wrong guesses.
import { randomInt } from 'node:crypto';
import { LIMITS } from './config.js';
import { HttpError, badRequest } from './validate.js';
import { keyedHash, safeEqual } from './tokens.js';
import { DEMO_LOGIN } from './demo-data.js';

// The demo account always uses the same code, never gets an SMS and needs nothing stored,
// so it signs in on any server instance.
const isDemoPhone = (config, phone) => config.demoMode && phone === DEMO_LOGIN.phone;

const keys = (phone) => ({
  code: `otp:code:${phone}`,
  tries: `otp:tries:${phone}`,
  cooldown: `otp:cooldown:${phone}`,
  sends: `otp:sends:${phone}`,
});

// Returns { devOtp } in dev mode, otherwise sends the SMS and returns {}.
export async function issueOtp({ store, config, sendSms }, phone, ip) {
  if (isDemoPhone(config, phone)) return { devOtp: DEMO_LOGIN.otp, demo: true };
  if (!config.otpDevMode && !sendSms) {
    throw new HttpError(503, 'sms_not_configured', 'SMS sending is not set up on the server yet.');
  }
  const k = keys(phone);

  const cooldownUntil = Number(await store.getTemp(k.cooldown));
  if (cooldownUntil > Date.now()) {
    const retryAfterSeconds = Math.ceil((cooldownUntil - Date.now()) / 1000);
    throw new HttpError(429, 'otp_cooldown', `Wait ${retryAfterSeconds} seconds before asking for another code.`, {
      retryAfterSeconds,
    });
  }
  if ((await store.incrTemp(k.sends, 3600)) > LIMITS.otpMaxSendsPerHour) {
    throw new HttpError(429, 'otp_limit', 'Too many codes requested for this number. Try again in an hour.');
  }
  if (ip && (await store.incrTemp(`otp:ip:${ip}`, 3600)) > LIMITS.otpMaxSendsPerIpPerHour) {
    throw new HttpError(429, 'otp_limit', 'Too many codes requested from this network. Try again later.');
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await store.setTemp(k.code, keyedHash(config.appSecret, 'otp', `${phone}:${code}`), LIMITS.otpTtlSeconds);
  await store.delTemp(k.tries);
  await store.setTemp(k.cooldown, Date.now() + LIMITS.otpResendSeconds * 1000, LIMITS.otpResendSeconds);

  if (config.otpDevMode) return { devOtp: code };

  try {
    await sendSms(
      phone,
      `${code} is your Newbi volunteer verification code. It is valid for 5 minutes. Do not share it with anyone.`,
    );
  } catch (err) {
    console.error('[volunteer-api] SMS failed:', err.message);
    await store.delTemp(k.code);
    await store.delTemp(k.cooldown);
    throw new HttpError(502, 'sms_failed', 'Could not send the SMS. Try again in a moment.');
  }
  return {};
}

// Throws unless the code matches the latest one sent to this phone. A matched code is used up.
export async function checkOtp({ store, config }, phone, otp) {
  const code = String(otp ?? '').trim();
  if (!/^\d{6}$/.test(code)) throw badRequest('invalid_otp', 'Enter the 6-digit code.', { field: 'otp' });
  if (isDemoPhone(config, phone)) {
    if (code !== DEMO_LOGIN.otp) {
      throw badRequest('wrong_otp', `That code is incorrect. The demo account's code is ${DEMO_LOGIN.otp}.`, { attemptsLeft: LIMITS.otpMaxAttempts });
    }
    return;
  }
  const k = keys(phone);

  const stored = await store.getTemp(k.code);
  if (!stored) throw badRequest('otp_expired', 'This code has expired or was never sent. Ask for a new one.');

  const tries = await store.incrTemp(k.tries, LIMITS.otpTtlSeconds);
  if (tries > LIMITS.otpMaxAttempts) {
    await store.delTemp(k.code);
    throw new HttpError(429, 'otp_locked', 'Too many wrong attempts. Ask for a new code.');
  }
  if (!safeEqual(stored, keyedHash(config.appSecret, 'otp', `${phone}:${code}`))) {
    const attemptsLeft = LIMITS.otpMaxAttempts - tries;
    throw badRequest('wrong_otp', attemptsLeft ? 'That code is incorrect.' : 'That code is incorrect. Ask for a new one.', {
      attemptsLeft,
    });
  }
  await store.delTemp(k.code);
  await store.delTemp(k.tries);
}

export function twilioSender({ accountSid, authToken, from }) {
  return async (to, body) => {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (!res.ok) throw new Error(`Twilio responded ${res.status}: ${await res.text()}`);
  };
}
