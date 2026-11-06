// End-to-end tests for the volunteer API, run against an in-memory store with a fake clock.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createVolunteerApi } from '../backend/volunteers/api.js';
import { loadConfig } from '../backend/volunteers/config.js';
import { createMemoryStore, createStore } from '../backend/volunteers/store.js';
import { cityField, indianMobile, verhoeffValid } from '../backend/volunteers/validate.js';
import { computeStats } from '../backend/volunteers/ranking.js';
import vercelHandler from '../api/v1.js';

// The Vercel handler builds its own API from env vars; keep its file store out of the repo.
process.env.VOLUNTEER_DB_FILE = join(tmpdir(), 'newbi-volunteer-test-unused.json');

// Appends the Verhoeff check digit to an 11-digit prefix.
function aadhaar(prefix) {
  for (let d = 0; d <= 9; d++) if (verhoeffValid(prefix + d)) return prefix + d;
  throw new Error('unreachable');
}

function setup() {
  let clock = new Date('2026-11-06T06:30:00Z'); // 12:00 in India
  const config = { ...loadConfig({}), otpDevMode: true, adminApiKey: 'test-admin-key' };
  const api = createVolunteerApi({ config, store: createMemoryStore(), sendSms: null, now: () => clock });
  const call = async (method, path, { body, token, query } = {}) => {
    const res = await api.handle({
      method,
      path,
      query: new URLSearchParams(query ?? {}),
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    return { status: res.status, ...res.body };
  };
  const setDate = (iso) => {
    clock = new Date(`${iso}T06:30:00Z`);
  };

  async function signUp(phone, profile) {
    const sent = await call('POST', '/auth/send-otp', { body: { phone } });
    const verified = await call('POST', '/auth/verify-otp', { body: { phone, otp: sent.devOtp } });
    const reg = await call('POST', '/auth/register', { token: verified.registrationToken, body: profile });
    assert.equal(reg.status, 201, JSON.stringify(reg));
    return reg;
  }
  async function adminToken() {
    const res = await call('POST', '/admin/login', { body: { apiKey: 'test-admin-key', name: 'Priya (Ops)' } });
    assert.equal(res.status, 200);
    return res.token;
  }
  return { api, call, setDate, signUp, adminToken };
}

const profile = (overrides = {}) => ({
  name: 'Rahul Kumar Sharma',
  aadhaarNumber: aadhaar('23456789012'),
  dateOfBirth: '2000-04-15',
  gender: 'male',
  city: 'New Delhi',
  skills: ['crowd management', 'ticketing'],
  emergencyContact: { name: 'Sunita Sharma', phone: '9811111111', relation: 'mother' },
  ...overrides,
});

test('validators: phone formats, Aadhaar checksum and city aliases', () => {
  for (const input of ['9876543210', '09876543210', '919876543210', '+91 98765-43210']) {
    assert.equal(indianMobile(input), '+919876543210');
  }
  assert.throws(() => indianMobile('12345'), /valid 10-digit/);
  assert.throws(() => indianMobile('5876543210'), /valid 10-digit/);

  assert.ok(verhoeffValid('2363')); // textbook example
  const valid = aadhaar('23456789012');
  assert.ok(verhoeffValid(valid));
  const typo = valid.slice(0, 5) + ((Number(valid[5]) + 1) % 10) + valid.slice(6);
  assert.ok(!verhoeffValid(typo), 'a single changed digit must fail the checksum');

  assert.deepEqual(cityField('  new   DELHI '), { city: 'Delhi', cityKey: 'delhi' });
  assert.deepEqual(cityField('Bangalore'), { city: 'Bengaluru', cityKey: 'bengaluru' });
  assert.deepEqual(cityField('navi-mumbai'), { city: 'Navi Mumbai', cityKey: 'navi-mumbai' });
});

test('ranking: points, rating bonus, no-show penalty and tiers', () => {
  const done = (rating) => ({ status: 'completed', review: { rating } });
  assert.equal(computeStats([done(5)]).points, 20);
  assert.equal(computeStats([done(3)]).points, 10);
  assert.equal(computeStats([done(1)]).points, 0);
  assert.equal(computeStats([{ status: 'no_show' }]).points, 0, 'points never go below zero');
  const veteran = computeStats(Array.from({ length: 8 }, () => done(5)));
  assert.equal(veteran.points, 160);
  assert.equal(veteran.tier, 'Gold');
  assert.deepEqual(veteran.nextTier, { name: 'Platinum', pointsNeeded: 140 });
  const mixed = computeStats([done(5), done(4), { status: 'no_show' }, { status: 'applied' }]);
  assert.equal(mixed.points, 20 + 15 - 15);
  assert.equal(mixed.averageRating, 4.5);
  assert.equal(mixed.reliability, 67);
});

test('OTP sign-up, registration rules and login', async () => {
  const { api, call } = setup();

  assert.equal((await call('POST', '/auth/send-otp', { body: { phone: '12345' } })).status, 400);

  const sent = await call('POST', '/auth/send-otp', { body: { phone: '98765 43210' } });
  assert.equal(sent.status, 200);
  assert.equal(sent.phone, '+919876543210');
  assert.match(sent.devOtp, /^\d{6}$/);

  const again = await call('POST', '/auth/send-otp', { body: { phone: '9876543210' } });
  assert.equal(again.status, 429);
  assert.equal(again.error.code, 'otp_cooldown');

  const wrongCode = sent.devOtp === '000000' ? '111111' : '000000';
  const wrong = await call('POST', '/auth/verify-otp', { body: { phone: '9876543210', otp: wrongCode } });
  assert.equal(wrong.status, 400);
  assert.equal(wrong.error.details.attemptsLeft, 4);

  const verified = await call('POST', '/auth/verify-otp', { body: { phone: '9876543210', otp: sent.devOtp } });
  assert.equal(verified.status, 200);
  assert.equal(verified.isNewUser, true);
  const regToken = verified.registrationToken;

  const reused = await call('POST', '/auth/verify-otp', { body: { phone: '9876543210', otp: sent.devOtp } });
  assert.equal(reused.error.code, 'otp_expired', 'an OTP works only once');

  const noToken = await call('POST', '/auth/register', { body: profile() });
  assert.equal(noToken.status, 401);

  const badAadhaar = await call('POST', '/auth/register', { token: regToken, body: profile({ aadhaarNumber: '123456789012' }) });
  assert.equal(badAadhaar.error.code, 'invalid_aadhaar');
  const minor = await call('POST', '/auth/register', { token: regToken, body: profile({ dateOfBirth: '2010-01-01' }) });
  assert.equal(minor.error.code, 'too_young');
  const typo = await call('POST', '/auth/register', { token: regToken, body: { ...profile(), aadhar: '1' } });
  assert.equal(typo.error.code, 'unknown_field');

  const reg = await call('POST', '/auth/register', { token: regToken, body: profile({ aadhaarNumber: '2345 6789 012' + aadhaar('23456789012').slice(-1) }) });
  assert.equal(reg.status, 201);
  assert.equal(reg.volunteer.city, 'Delhi');
  assert.equal(reg.volunteer.aadhaar, `XXXX XXXX ${aadhaar('23456789012').slice(-4)}`);
  assert.equal(reg.volunteer.kyc.status, 'pending');
  assert.ok(!JSON.stringify(reg).includes(aadhaar('23456789012')), 'the full Aadhaar number is never returned');

  const twice = await call('POST', '/auth/register', { token: regToken, body: profile() });
  assert.equal(twice.error.code, 'already_registered');

  // A second phone can't reuse the same Aadhaar.
  const other = await call('POST', '/auth/send-otp', { body: { phone: '9123456789' } });
  const otherVerified = await call('POST', '/auth/verify-otp', { body: { phone: '9123456789', otp: other.devOtp } });
  const dup = await call('POST', '/auth/register', { token: otherVerified.registrationToken, body: profile({ name: 'Someone Else' }) });
  assert.equal(dup.status, 409);
  assert.equal(dup.error.code, 'aadhaar_in_use');

  // Signing in again with an OTP returns the existing account (skipping the real-time resend cooldown).
  await api.svc.store.delTemp('otp:cooldown:+919876543210');
  const login = await call('POST', '/auth/send-otp', { body: { phone: '+919876543210' } });
  const back = await call('POST', '/auth/verify-otp', { body: { phone: '9876543210', otp: login.devOtp } });
  assert.equal(back.isNewUser, false);
  assert.equal(back.volunteer.id, reg.volunteer.id);
  const me = await call('GET', '/volunteer/me', { token: back.token });
  assert.equal(me.status, 200);
  assert.equal(me.volunteer.standing.city.rank, null);
});

test('volunteers only see and apply to events in their own city', async () => {
  const { call, signUp, adminToken } = setup();
  const delhi = await signUp('9876543210', profile());
  const mumbai = await signUp('9123456789', profile({ name: 'Asha Patil', aadhaarNumber: aadhaar('34567890123'), city: 'Bombay' }));
  const admin = await adminToken();

  const mk = (body) => call('POST', '/admin/events', { token: admin, body });
  const dEvent = await mk({ title: 'Diwali Mela', city: 'delhi', venue: 'JLN Stadium', date: '2026-11-10', startTime: '16:00', volunteersNeeded: 2, roles: ['Entry gate', 'Ticketing'] });
  assert.equal(dEvent.status, 201);
  const mEvent = await mk({ title: 'Sunburn Warmup', city: 'Mumbai', venue: 'NSCI Dome', date: '2026-11-12', volunteersNeeded: 5 });
  await mk({ title: 'Old Delhi Walk', city: 'Delhi', venue: 'Red Fort', date: '2026-11-05', volunteersNeeded: 3 }).then((r) =>
    assert.equal(r.error.code, 'date_in_past'),
  );
  const closed = await mk({ title: 'Closed one', city: 'Delhi', venue: 'Siri Fort', date: '2026-11-20', volunteersNeeded: 3, status: 'closed' });

  const delhiList = await call('GET', '/volunteer/events', { token: delhi.token });
  assert.equal(delhiList.city, 'Delhi');
  assert.deepEqual(delhiList.events.map((e) => e.title), ['Diwali Mela']);
  assert.equal(delhiList.events[0].slotsLeft, 2);
  assert.equal(delhiList.events[0].myApplication, null);

  const mumbaiList = await call('GET', '/volunteer/events', { token: mumbai.token });
  assert.deepEqual(mumbaiList.events.map((e) => e.title), ['Sunburn Warmup']);

  const cross = await call('POST', `/volunteer/events/${mEvent.event.id}/apply`, { token: delhi.token });
  assert.equal(cross.status, 403);
  assert.equal(cross.error.code, 'city_mismatch');
  assert.equal((await call('GET', `/volunteer/events/${mEvent.event.id}`, { token: delhi.token })).status, 403);

  const closedApply = await call('POST', `/volunteer/events/${closed.event.id}/apply`, { token: delhi.token });
  assert.equal(closedApply.error.code, 'event_not_open');

  const badRole = await call('POST', `/volunteer/events/${dEvent.event.id}/apply`, { token: delhi.token, body: { preferredRole: 'DJ' } });
  assert.equal(badRole.status, 400);
  const applied = await call('POST', `/volunteer/events/${dEvent.event.id}/apply`, { token: delhi.token, body: { preferredRole: 'ticketing' } });
  assert.equal(applied.status, 201);
  assert.equal(applied.application.status, 'applied');
  const dupe = await call('POST', `/volunteer/events/${dEvent.event.id}/apply`, { token: delhi.token });
  assert.equal(dupe.error.code, 'already_applied');

  // Moving city changes which events are shown.
  const moved = await call('PATCH', '/volunteer/me', { token: delhi.token, body: { city: 'Mumbai' } });
  assert.equal(moved.volunteer.city, 'Mumbai');
  const afterMove = await call('GET', '/volunteer/events', { token: delhi.token });
  assert.deepEqual(afterMove.events.map((e) => e.title), ['Sunburn Warmup']);
  // ...but an event they already applied to stays visible.
  assert.equal((await call('GET', `/volunteer/events/${dEvent.event.id}`, { token: delhi.token })).status, 200);

  const cities = await call('GET', '/cities');
  assert.deepEqual(cities.cities.map((c) => [c.city, c.upcomingEvents]), [['Delhi', 1], ['Mumbai', 1]]);
});

test('approval needs verified KYC, reviews feed the ranking and leaderboard', async () => {
  const { call, setDate, signUp, adminToken } = setup();
  const rahul = await signUp('9876543210', profile());
  const asha = await signUp('9123456789', profile({ name: 'Asha Patil', aadhaarNumber: aadhaar('34567890123') }));
  const vikram = await signUp('9000000001', profile({ name: 'Vikram Rao', aadhaarNumber: aadhaar('45678901234') }));
  let admin = await adminToken();

  const event = (await call('POST', '/admin/events', {
    token: admin,
    body: { title: 'Arijit Live', city: 'Delhi', venue: 'IG Stadium', date: '2026-11-08', volunteersNeeded: 2 },
  })).event;
  const apply = async (v) => (await call('POST', `/volunteer/events/${event.id}/apply`, { token: v.token })).application.id;
  const [rahulApp, ashaApp, vikramApp] = [await apply(rahul), await apply(asha), await apply(vikram)];

  const volunteerOnly = await call('GET', '/admin/events', { token: rahul.token });
  assert.equal(volunteerOnly.status, 403, 'volunteers cannot use admin endpoints');

  const decide = (id, decision) => call('POST', `/admin/applications/${id}/decision`, { token: admin, body: { decision } });
  const early = await decide(rahulApp, 'approve');
  assert.equal(early.error.code, 'kyc_not_verified');

  for (const v of [rahul, asha, vikram]) {
    const r = await call('PATCH', `/admin/volunteers/${v.volunteer.id}`, { token: admin, body: { kycStatus: 'verified' } });
    assert.equal(r.volunteer.kyc.status, 'verified');
    assert.equal(r.volunteer.kyc.reviewedBy, 'Priya (Ops)');
  }
  const locked = await call('PATCH', '/volunteer/me', { token: rahul.token, body: { name: 'New Name' } });
  assert.equal(locked.error.code, 'kyc_locked');

  assert.equal((await decide(rahulApp, 'approve')).application.status, 'approved');
  assert.equal((await decide(ashaApp, 'approve')).application.status, 'approved');
  const full = await decide(vikramApp, 'approve');
  assert.equal(full.error.code, 'event_full');
  await decide(vikramApp, 'reject');

  const review = (id, body) => call('POST', `/admin/applications/${id}/review`, { token: admin, body });
  const tooSoon = await review(rahulApp, { outcome: 'completed', rating: 5 });
  assert.equal(tooSoon.error.code, 'event_not_started');

  setDate('2026-11-09');
  assert.equal((await review(rahulApp, { outcome: 'completed', rating: 5 })).error.code, 'unauthorized', 'admin tokens last 12 hours');
  admin = await adminToken();
  assert.equal((await review(rahulApp, { outcome: 'completed' })).error.code, 'missing_field', 'rating is required');
  assert.equal((await review(vikramApp, { outcome: 'completed', rating: 4 })).error.code, 'not_reviewable');
  const rated = await review(rahulApp, { outcome: 'completed', rating: 5, comment: 'Handled the entry rush brilliantly.' });
  assert.equal(rated.volunteerStats.points, 20);
  await review(ashaApp, { outcome: 'completed', rating: 3 });

  const board = await call('GET', '/leaderboard', { token: asha.token });
  assert.equal(board.scope, 'Delhi');
  assert.deepEqual(board.leaderboard.map((r) => [r.rank, r.name, r.points]), [[1, 'Rahul S.', 20], [2, 'Asha P.', 10]]);
  assert.equal(board.you.rank, 2);
  assert.equal(board.you.isYou, true);

  const adminBoard = await call('GET', '/leaderboard', { token: admin, query: { city: 'all' } });
  assert.equal(adminBoard.leaderboard[0].name, 'Rahul Kumar Sharma');

  // Correcting a review recomputes everything (ranking is derived, never stored).
  await review(rahulApp, { outcome: 'no_show' });
  const after = await call('GET', '/leaderboard', { token: admin });
  assert.deepEqual(after.leaderboard.map((r) => [r.name, r.points]), [['Asha Patil', 10], ['Rahul Kumar Sharma', 0]]);

  const me = await call('GET', '/volunteer/me', { token: asha.token });
  assert.equal(me.volunteer.stats.completedEvents, 1);
  assert.deepEqual(me.volunteer.standing.city, { name: 'Delhi', rank: 1, rankedVolunteers: 2 });

  const history = await call('GET', '/volunteer/applications', { token: asha.token });
  assert.equal(history.applications[0].review.rating, 3);
  assert.equal(history.applications[0].review.reviewedBy, undefined, 'volunteers do not see who rated them');

  const applicants = await call('GET', `/admin/events/${event.id}/applications`, { token: admin });
  assert.deepEqual(applicants.applications.map((a) => a.status), ['completed', 'no_show', 'rejected']);
  assert.equal(applicants.event.counts.filled, 2);

  // Suspended volunteers are locked out.
  await call('PATCH', `/admin/volunteers/${vikram.volunteer.id}`, { token: admin, body: { status: 'suspended' } });
  assert.equal((await call('GET', '/volunteer/me', { token: vikram.token })).error.code, 'account_suspended');
});

test('withdrawing and re-applying, and event capacity edits', async () => {
  const { call, signUp, adminToken } = setup();
  const v = await signUp('9876543210', profile());
  const admin = await adminToken();
  await call('PATCH', `/admin/volunteers/${v.volunteer.id}`, { token: admin, body: { kycStatus: 'verified' } });
  const event = (await call('POST', '/admin/events', {
    token: admin,
    body: { title: 'Book Fair', city: 'Delhi', venue: 'Pragati Maidan', date: '2026-11-15', volunteersNeeded: 1 },
  })).event;

  const first = await call('POST', `/volunteer/events/${event.id}/apply`, { token: v.token });
  await call('POST', `/admin/applications/${first.application.id}/decision`, { token: admin, body: { decision: 'approve' } });
  const lower = await call('PATCH', `/admin/events/${event.id}`, { token: admin, body: { volunteersNeeded: 0 } });
  assert.equal(lower.status, 400);
  const moveCity = await call('PATCH', `/admin/events/${event.id}`, { token: admin, body: { city: 'Pune' } });
  assert.equal(moveCity.error.code, 'city_locked');

  const withdrawn = await call('POST', `/volunteer/events/${event.id}/withdraw`, { token: v.token });
  assert.equal(withdrawn.application.status, 'withdrawn');
  const back = await call('POST', `/volunteer/events/${event.id}/apply`, { token: v.token });
  assert.equal(back.status, 201);
  assert.equal(back.application.id, first.application.id, 're-applying reuses the application');
  assert.equal(back.application.status, 'applied');
});

test('router: 404, 405, bad JSON, bad tokens, endpoint index', async () => {
  const { call } = setup();
  assert.equal((await call('GET', '/nope')).status, 404);
  assert.equal((await call('DELETE', '/volunteer/me')).status, 405);
  assert.equal((await call('POST', '/auth/send-otp', { body: '{bad json' })).error.code, 'invalid_json');
  assert.equal((await call('GET', '/volunteer/me', { token: 'abc.def.ghi' })).status, 401);
  const index = await call('GET', '/');
  assert.ok(index.endpoints.some((e) => e.path === '/api/v1/volunteer/events' && e.auth === 'volunteer'));
});

test('file store keeps data across restarts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vol-store-'));
  try {
    const file = join(dir, 'db.json');
    const a = createStore({ dbFile: file });
    await a.hset('events', 'e1', '{"x":1}');
    assert.equal(await a.hsetnx('idx', 'k', 'v1'), true);
    assert.equal(await a.hsetnx('idx', 'k', 'v2'), false);
    assert.equal(await a.hget('idx', 'constructor'), null);
    const b = createStore({ dbFile: file });
    assert.equal(await b.hget('events', 'e1'), '{"x":1}');
    assert.equal(await b.hget('idx', 'k'), 'v1');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Vercel function routes the rewritten path', async () => {
  const run = async (req) => {
    const out = { headers: {} };
    await vercelHandler(req, {
      setHeader: (k, v) => (out.headers[k] = v),
      set statusCode(code) {
        out.status = code;
      },
      end: (body) => (out.body = body && JSON.parse(body)),
    });
    return out;
  };
  const viaRewrite = await run({ method: 'GET', url: '/api/v1?__path=ranking/rules', query: { __path: 'ranking/rules' }, headers: {} });
  assert.equal(viaRewrite.status, 200);
  assert.equal(viaRewrite.body.rules.pointsPerCompletedEvent, 10);
  const direct = await run({ method: 'GET', url: '/api/v1/ranking/rules', query: {}, headers: {} });
  assert.equal(direct.status, 200);
});
