// End-to-end tests for the OSH API, run against in-memory stores with a fake clock.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createVolunteerApi } from '../backend/volunteers/api.js';
import { loadConfig } from '../backend/volunteers/config.js';
import { createMemoryStore, createStore, sqliteStore } from '../backend/volunteers/store.js';
import { createRequire } from 'node:module';
import { cityField, indianMobile, verhoeffValid } from '../backend/volunteers/validate.js';
import { computeStats } from '../backend/volunteers/ranking.js';
import vercelHandler from '../api/v1.js';

// The Vercel handler builds its own API from env vars; keep its file store out of the repo.
process.env.VOLUNTEER_DB_FILE = join(tmpdir(), 'newbi-volunteer-test-unused.json');
process.env.SQLITE_FILE = ':memory:';
process.env.DEMO_MODE = 'false';

// Appends the Verhoeff check digit to an 11-digit prefix.
function aadhaar(prefix) {
  for (let d = 0; d <= 9; d++) if (verhoeffValid(prefix + d)) return prefix + d;
  throw new Error('unreachable');
}

function setup({ store = sqliteStore(':memory:') } = {}) {
  let clock = new Date('2026-11-06T06:30:00Z'); // 12:00 in India
  const config = { ...loadConfig({}), otpDevMode: true, adminApiKey: 'test-admin-key', demoMode: false };
  const api = createVolunteerApi({ config, store, sendSms: null, now: () => clock });
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
  department: 'Crowd management',
  experience: 'Fresher',
  availability: 'Event based',
  skills: ['crowd management', 'guest relations'],
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
  assert.equal(veteran.tier, 'Experienced');
  assert.deepEqual(veteran.nextTier, { name: '5-Star Elite', pointsNeeded: 140 });
  assert.equal(computeStats([]).tier, 'New Joiner');
  assert.equal(computeStats([done(5), done(5), done(4)]).tier, 'Trained');
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
  const badDepartment = await call('POST', '/auth/register', { token: regToken, body: profile({ department: 'Juggling' }) });
  assert.equal(badDepartment.error.code, 'invalid_field');
  assert.ok(badDepartment.error.details.allowed.includes('Crowd management'));

  const reg = await call('POST', '/auth/register', { token: regToken, body: profile({ aadhaarNumber: '2345 6789 012' + aadhaar('23456789012').slice(-1) }) });
  assert.equal(reg.status, 201);
  assert.equal(reg.volunteer.city, 'Delhi');
  assert.equal(reg.volunteer.aadhaar, `XXXX XXXX ${aadhaar('23456789012').slice(-4)}`);
  assert.equal(reg.volunteer.kyc.status, 'pending');
  assert.deepEqual([reg.volunteer.department, reg.volunteer.experience, reg.volunteer.availability], ['Crowd management', 'Fresher', 'Event based']);
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
  const dEvent = await mk({ title: 'Diwali Mela', city: 'delhi', venue: 'JLN Stadium', date: '2026-11-10', startTime: '16:00', volunteersNeeded: 2, roles: ['Entry gate', 'Ticketing'], image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' });
  assert.equal(dEvent.status, 201);
  assert.equal(dEvent.event.image, 'https://res.cloudinary.com/demo/image/upload/sample.jpg');
  for (const image of ['javascript:alert(1)', 'http://insecure.example/x.jpg', '"><script>']) {
    const bad = await mk({ title: 'Bad image', city: 'Delhi', venue: 'X', date: '2026-11-20', volunteersNeeded: 1, image });
    assert.equal(bad.status, 400, image);
  }
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

test('prototype defaults: hardcoded secrets, dev OTP, demo mode on', () => {
  const prod = loadConfig({ VERCEL: '1' });
  assert.ok(prod.appSecret.length >= 32);
  assert.equal(prod.adminApiKey, 'newbi-admin-2026');
  assert.equal(prod.otpDevMode, true);
  assert.equal(prod.usingPrototypeSecrets, true);
  assert.equal(prod.demoMode, true);
  const overridden = loadConfig({ VERCEL: '1', APP_SECRET: 'x'.repeat(40), ADMIN_API_KEY: 'mine', OTP_DEV_MODE: 'false', DEMO_MODE: 'false' });
  assert.equal(overridden.adminApiKey, 'mine');
  assert.equal(overridden.otpDevMode, false);
  assert.equal(overridden.usingPrototypeSecrets, false);
  assert.equal(overridden.demoMode, false);
});

// Two API copies with separate stores, like two copies of the function on Vercel.
function demoCopies({ store } = {}) {
  let clock = new Date('2026-11-06T06:30:00Z');
  const config = { ...loadConfig({}), demoMode: true };
  const make = (s) => {
    const api = createVolunteerApi({ config, store: s, sendSms: null, now: () => clock });
    return async (method, path, { body, token, query } = {}) => {
      const res = await api.handle({ method, path, query: new URLSearchParams(query ?? {}), headers: token ? { authorization: `Bearer ${token}` } : {}, body: body && JSON.stringify(body) });
      return { status: res.status, ...res.body };
    };
  };
  return { a: make(store ?? createMemoryStore()), b: make(createMemoryStore()), setDate: (d) => (clock = new Date(`${d}T06:30:00Z`)) };
}

test('demo login: fixed OTP and the same populated dashboard on every server copy', async () => {
  const { a, b, setDate } = demoCopies();

  const health = await a('GET', '/health');
  assert.deepEqual(health.demoLogin, { phone: '99999 99999', otp: '123456' });

  // Code requested on copy A, checked on copy B: nothing needs to be shared.
  const sent = await a('POST', '/auth/send-otp', { body: { phone: '99999 99999' } });
  assert.equal(sent.devOtp, '123456');
  assert.equal((await a('POST', '/auth/send-otp', { body: { phone: '9999999999' } })).status, 200, 'no resend cooldown for the demo');
  assert.equal((await b('POST', '/auth/verify-otp', { body: { phone: '9999999999', otp: '111111' } })).error.code, 'wrong_otp');
  const login = await b('POST', '/auth/verify-otp', { body: { phone: '9999999999', otp: '123456' } });
  assert.equal(login.isNewUser, false);
  assert.equal(login.volunteer.name, 'Riya Kapoor');
  assert.equal(login.volunteer.demo, true);

  const meA = await a('GET', '/volunteer/me', { token: login.token });
  const meB = await b('GET', '/volunteer/me', { token: login.token });
  assert.deepEqual(meA.volunteer, meB.volunteer);
  assert.equal(meA.demoReadOnly, true, 'memory storage is not kept, so the demo is view-only');
  const s = meA.volunteer.stats;
  assert.deepEqual([s.points, s.tier, s.completedEvents, s.averageRating], [55, 'Trained', 3, 4.7]);
  assert.deepEqual(meA.volunteer.standing.city, { name: 'Delhi', rank: 2, rankedVolunteers: 5 });
  assert.equal(meA.volunteer.kyc.status, 'verified');

  const eventsA = await a('GET', '/volunteer/events', { token: login.token });
  const eventsB = await b('GET', '/volunteer/events', { token: login.token });
  assert.deepEqual(eventsA.events, eventsB.events);
  assert.deepEqual(eventsA.events.map((e) => [e.title, e.date, e.myApplication?.status ?? null, e.slotsLeft]), [
    ['Corporate Annual Awards', '2026-11-19', 'approved', 16],
    ['New Year Private Gala', '2026-12-30', null, 20],
  ]);
  assert.equal(eventsA.events[0].image, '/volunteer/img/events/comedy.jpg');
  assert.match(eventsA.events[0].imageCredit, /^Photo: .+, CC BY/);
  assert.match(eventsA.events[0].imageCreditUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.equal(eventsA.events[0].demo, true);
  assert.equal(meA.volunteer.department, 'Crowd management');

  const history = await b('GET', '/volunteer/applications', { token: login.token });
  assert.deepEqual(history.applications.map((x) => [x.event.title, x.status, x.review?.rating ?? null]), [
    ['Corporate Annual Awards', 'approved', null],
    ['Sneaker Drop Pop-up', 'completed', 5],
    ['College Fest: Spring Edition', 'completed', 4],
    ['Holi Colour Fest', 'completed', 5],
  ]);
  assert.equal(history.applications[3].event.image, '/volunteer/img/events/holi.jpg');

  const board = await a('GET', '/leaderboard', { token: login.token });
  assert.deepEqual(board.leaderboard.map((r) => [r.rank, r.name, r.points]), [
    [1, 'Arjun M.', 60], [2, 'Riya K.', 55], [3, 'Sana K.', 35], [4, 'Kabir S.', 35], [5, 'Meera I.', 5],
  ]);
  assert.equal(board.you.rank, 2);

  const blocked = await a('POST', `/volunteer/events/${eventsA.events[1].id}/apply`, { token: login.token });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.error.code, 'demo_read_only');
  assert.equal((await a('PATCH', '/volunteer/me', { token: login.token, body: { city: 'Mumbai' } })).error.code, 'demo_read_only');

  // Real sign-ups still see the demo events in their city.
  const cities = (await b('GET', '/cities')).cities;
  assert.ok(cities.some((c) => c.city === 'Delhi' && c.upcomingEvents === 2));

  // The next day the demo is rewritten with fresh dates.
  setDate('2026-11-07');
  const tomorrow = await a('GET', '/volunteer/events', { token: login.token });
  assert.equal(tomorrow.events[0].date, '2026-11-20');
});

test('public site: crew listings, filters, network stats and Star Volunteers', async () => {
  const { a, b } = demoCopies();

  const all = await a('GET', '/events');
  assert.equal(all.status, 200);
  assert.equal(all.total, 12, 'every upcoming demo event, all cities');
  assert.deepEqual(all.categories, [
    { name: 'Music & Concerts', count: 4 },
    { name: 'Corporate Events', count: 3 },
    { name: 'College Festivals', count: 3 },
    { name: 'Private Events', count: 2 },
  ]);
  assert.deepEqual(all.cities.slice(0, 3).map((c) => [c.city, c.count]), [['Delhi', 2], ['Lucknow', 2], ['Mumbai', 2]]);
  assert.equal(all.cities.length, 9);
  assert.ok(all.cities.some((c) => c.city === 'Punjab' && c.count === 1), 'network regions work like cities');
  assert.ok(all.events.every((e, i, list) => i === 0 || list[i - 1].date <= e.date), 'soonest first');
  assert.ok(all.events.every((e) => e.image && e.category && e.roles.length && e.slotsLeft > 0 && e.demo === true));
  assert.ok(all.events.every((e) => !('tickets' in e) && !('priceFrom' in e)), 'no ticketing');
  assert.equal(all.events[0].title, 'DJ Night – Live Concert');

  const corporate = await a('GET', '/events', { query: { category: 'Corporate Events' } });
  assert.deepEqual(corporate.events.map((e) => e.title), ['Corporate Annual Awards', 'Brand Leadership Summit', 'Corporate Product Launch']);
  assert.deepEqual((await a('GET', '/events', { query: { q: 'sangeet' } })).events.map((e) => e.title), ['Luxury Wedding Celebration']);
  assert.deepEqual((await a('GET', '/events', { query: { q: 'front-of-house' } })).events.map((e) => e.title), ['Winter Live Tour'], 'roles are searchable');
  assert.equal((await a('GET', '/events', { query: { city: 'Bombay' } })).events.length, 2);
  assert.deepEqual((await a('GET', '/events', { query: { city: 'Gurgaon' } })).events.map((e) => e.title), ['Grand Music Festival']);
  assert.equal((await a('GET', '/events', { query: { category: 'Opera' } })).status, 400);

  const detail = await b('GET', '/events/evt_demo_summit');
  assert.deepEqual(detail.event.roles, ['Delegate support', 'Registration desk', 'Hall management']);
  assert.deepEqual(detail.event.highlights, ['Keynote Talks', 'Panel Discussions', 'Networking Lunch', 'Expo Booths']);
  assert.deepEqual([detail.event.volunteersNeeded, detail.event.slotsLeft], [14, 14]);
  assert.equal((await a('POST', '/events/evt_demo_summit/bookings', { body: {} })).status, 404, 'ticket booking is gone');

  const stats = await a('GET', '/stats');
  assert.deepEqual(
    [stats.upcomingEvents, stats.activeCities, stats.volunteerPositions, stats.interestResponses, stats.volunteers, stats.verifiedVendors],
    [12, 9, 292, 3, 5, 0],
  );

  const stars = await b('GET', '/star-volunteers', { query: { limit: '3' } });
  assert.deepEqual(stars.volunteers.map((v) => [v.rank, v.name, v.tier, v.points]), [
    [1, 'Arjun M.', 'Trained', 60], [2, 'Riya K.', 'Trained', 55], [3, 'Sana K.', 'New Joiner', 35],
  ]);
  assert.ok(stars.volunteers.every((v) => !('phone' in v) && !('id' in v)), 'no contact details or ids in public lists');

  const options = await a('GET', '/options');
  assert.deepEqual(options.categories, all.categories.map((c) => c.name));
  assert.equal(options.networkCities[0], 'Lucknow');
  assert.ok(options.departments.includes('Crowd management') && options.vendorCategories.includes('Sound & lights'));
});

test('vendor registration, feedback and the admin dashboard', async () => {
  const { call, adminToken } = setup();
  const vendor = { companyName: 'Sonic Sound Co.', contactPerson: 'Ravi Kumar', phone: '98765 43210', city: 'Lucknow', category: 'Sound & lights', gstin: '09aaach 7409r1zz', services: 'Line arrays, DJ consoles and a lighting rig for 5,000 people.' };
  const created = await call('POST', '/vendors', { body: vendor });
  assert.equal(created.status, 201, JSON.stringify(created));
  assert.match(created.vendor.id, /^ven_/);
  assert.equal(created.vendor.status, 'pending');
  assert.equal((await call('POST', '/vendors', { body: vendor })).error.code, 'vendor_exists', 'one registration per mobile number');
  assert.equal((await call('POST', '/vendors', { body: { ...vendor, phone: '9123456780', gstin: '12345' } })).error.code, 'invalid_gstin');
  assert.equal((await call('POST', '/vendors', { body: { ...vendor, phone: '9123456780', category: 'Fireworks' } })).status, 400);
  assert.equal((await call('POST', '/vendors', { body: { ...vendor, phone: '9123456780', companyName: '' } })).error.code, 'missing_field');
  const noGst = await call('POST', '/vendors', { body: { ...vendor, phone: '9123456780', gstin: '', city: 'Gurgaon' } });
  assert.equal(noGst.status, 201);
  assert.equal(noGst.vendor.city, 'Gurugram');

  const fb = await call('POST', '/feedback', { body: { category: 'Work environment', message: 'Drinking water ran out at gate 3 by 7 pm.' } });
  assert.equal(fb.status, 201);
  assert.match(fb.feedback.id, /^fbk_/);
  await call('POST', '/feedback', { body: { category: 'Suggestion', name: 'Sana', message: 'A crew WhatsApp group per event would help.' } });
  assert.equal((await call('POST', '/feedback', { body: { category: 'Suggestion', message: 'ok' } })).status, 400);
  assert.equal((await call('POST', '/feedback', { body: { category: 'Gossip', message: 'Something long enough.' } })).status, 400);
  assert.equal((await call('GET', '/admin/feedback')).status, 401, 'only admins can read feedback');

  const admin = await adminToken();
  const overview = await call('GET', '/admin/overview', { token: admin });
  assert.deepEqual(overview.vendors, { total: 2, pending: 2 });
  assert.deepEqual(overview.feedback, { total: 2, new: 2 });
  assert.deepEqual(overview.events, { listed: 0, upcoming: 0 });

  const vendors = await call('GET', '/admin/vendors', { token: admin, query: { city: 'Lucknow' } });
  assert.equal(vendors.total, 1);
  assert.equal(vendors.vendors[0].gstin, '09AAACH7409R1ZZ');
  const verified = await call('PATCH', `/admin/vendors/${created.vendor.id}`, { token: admin, body: { status: 'verified', note: 'GST checked' } });
  assert.deepEqual([verified.vendor.status, verified.vendor.reviewedBy], ['verified', 'Priya (Ops)']);
  assert.equal((await call('GET', '/stats')).verifiedVendors, 1);

  const inbox = await call('GET', '/admin/feedback', { token: admin });
  assert.deepEqual(inbox.feedback.map((f) => [f.category, f.name]).sort(), [['Suggestion', 'Sana'], ['Work environment', null]]);
  const resolved = await call('PATCH', `/admin/feedback/${fb.feedback.id}`, { token: admin, body: { status: 'resolved' } });
  assert.equal(resolved.feedback.resolvedBy, 'Priya (Ops)');
  assert.equal((await call('GET', '/admin/feedback', { token: admin, query: { status: 'new' } })).total, 1);

  // Events have no ticket types any more; the new categories are accepted.
  const withTickets = await call('POST', '/admin/events', { token: admin, body: { title: 'X', city: 'Delhi', venue: 'Y', date: '2026-11-20', volunteersNeeded: 1, tickets: [] } });
  assert.equal(withTickets.error.code, 'unknown_field');
  const gala = await call('POST', '/admin/events', { token: admin, body: { title: 'Sangeet Night', city: 'Jaipur', venue: 'Rambagh', date: '2026-11-20', volunteersNeeded: 6, category: 'Private Events', roles: ['Guest hospitality'] } });
  assert.equal(gala.status, 201);
  assert.equal(gala.event.category, 'Private Events');
});

test('demo events from older versions are cleaned up', async () => {
  const store = createMemoryStore();
  const old = (id) => ({ id, title: 'Old ' + id, city: 'Hyderabad', cityKey: 'hyderabad', venue: 'X', date: '2026-11-10', roles: [], volunteersNeeded: 5, status: 'open', createdBy: 'Demo data', createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' });
  await store.hset('events', 'evt_demo_edm', JSON.stringify(old('evt_demo_edm')));
  await store.hset('events', 'evt_demo_hackathon', JSON.stringify(old('evt_demo_hackathon')));
  const app = (id, eventId, volunteerId) => ({ id, eventId, volunteerId, status: 'applied', appliedAt: '2026-10-02T00:00:00Z' });
  await store.hset('applications', 'app_demo_riya_edm', JSON.stringify(app('app_demo_riya_edm', 'evt_demo_edm', 'vol_demo_riya')));
  await store.hset('idx:application', 'evt_demo_edm:vol_demo_riya', 'app_demo_riya_edm');
  await store.hset('applications', 'app_real', JSON.stringify(app('app_real', 'evt_demo_hackathon', 'vol_real')));

  const { a } = demoCopies({ store });
  assert.equal((await a('GET', '/cities')).status, 200);
  assert.equal(await store.hget('events', 'evt_demo_edm'), null, 'an unused old demo event is removed');
  assert.equal(await store.hget('applications', 'app_demo_riya_edm'), null);
  assert.equal(await store.hget('idx:application', 'evt_demo_edm:vol_demo_riya'), null);
  assert.equal(JSON.parse(await store.hget('events', 'evt_demo_hackathon')).status, 'cancelled', 'one a real volunteer applied to is kept, cancelled');
  assert.ok(await store.hget('applications', 'app_real'));
  assert.equal((await a('GET', '/events')).total, 12);
});

test('demo account can apply where storage is kept (local SQLite)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vol-demo-'));
  const store = sqliteStore(join(dir, 'newbi.sqlite'));
  try {
    const { a } = demoCopies({ store });
    const login = await a('POST', '/auth/verify-otp', { body: { phone: '9999999999', otp: '123456' } });
    const me = await a('GET', '/volunteer/me', { token: login.token });
    assert.equal(me.demoReadOnly, false);
    const events = await a('GET', '/volunteer/events', { token: login.token });
    const applied = await a('POST', `/volunteer/events/${events.events[1].id}/apply`, { token: login.token });
    assert.equal(applied.status, 201);
    assert.equal(applied.application.status, 'applied');
  } finally {
    store.close();
    await rm(dir, { recursive: true, force: true });
  }
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

test('SQLite store: readable tables, uniqueness, counters, expiry and restarts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vol-sqlite-'));
  const file = join(dir, 'newbi.sqlite');
  const a = sqliteStore(file);
  try {
    await a.hset('volunteers', 'vol_1', JSON.stringify({ id: 'vol_1', name: 'Rahul', city: 'Delhi', kyc: { status: 'pending' } }));
    await a.hset('volunteers', 'vol_1', JSON.stringify({ id: 'vol_1', name: 'Rahul', city: 'Delhi', kyc: { status: 'verified' } }));
    assert.equal(await a.hsetnx('idx:phone', '+919876543210', 'vol_1'), true);
    assert.equal(await a.hsetnx('idx:phone', '+919876543210', 'vol_2'), false);
    assert.equal(await a.hget('idx:phone', 'constructor'), null);
    assert.equal(await a.incrTemp('rate', 60), 1);
    assert.equal(await a.incrTemp('rate', 60), 2);
    await a.setTemp('otp', 'hash', 60);
    assert.equal(await a.getTemp('otp'), 'hash');
    await a.setTemp('expired', 'x', -1);
    assert.equal(await a.getTemp('expired'), null);
    assert.equal(await a.incrTemp('expired', 60), 1, 'an expired counter starts again');
    await a.hdel('idx:phone', '+919876543210');
    assert.deepEqual(await a.hgetall('idx:phone'), {});
    a.close();

    const b = sqliteStore(file); // a server restart
    assert.equal(JSON.parse(await b.hget('volunteers', 'vol_1')).kyc.status, 'verified');
    assert.equal(await b.getTemp('otp'), 'hash');
    b.close();

    const Database = createRequire(import.meta.url)('better-sqlite3');
    const raw = new Database(file, { readonly: true });
    assert.deepEqual(raw.prepare('SELECT id, name, city, kyc_status FROM volunteers').get(), {
      id: 'vol_1', name: 'Rahul', city: 'Delhi', kyc_status: 'verified',
    });
    raw.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('SQLite: the whole flow survives an API restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vol-sqlite-flow-'));
  const file = join(dir, 'newbi.sqlite');
  const opened = [];
  const open = () => {
    const store = sqliteStore(file);
    opened.push(store);
    return store;
  };
  try {
    const first = setup({ store: open() });
    const v = await first.signUp('9876543210', profile());
    const admin = await first.adminToken();
    const { event } = await first.call('POST', '/admin/events', {
      token: admin,
      body: { title: 'Diwali Mela', city: 'Delhi', venue: 'JLN Stadium', date: '2026-11-08', volunteersNeeded: 5 },
    });
    const { application } = await first.call('POST', `/volunteer/events/${event.id}/apply`, { token: v.token });
    await first.call('PATCH', `/admin/volunteers/${v.volunteer.id}`, { token: admin, body: { kycStatus: 'verified' } });
    await first.call('POST', `/admin/applications/${application.id}/decision`, { token: admin, body: { decision: 'approve' } });
    first.setDate('2026-11-08');
    const review = await first.call('POST', `/admin/applications/${application.id}/review`, {
      token: await first.adminToken(),
      body: { outcome: 'completed', rating: 5 },
    });
    assert.equal(review.volunteerStats.points, 20);
    opened.pop().close();

    // New server process, same database file: the volunteer signs straight back in.
    const second = setup({ store: open() });
    // The 30 s resend cooldown is stored too and survives the restart; skip it.
    assert.ok(await second.api.svc.store.getTemp('otp:cooldown:+919876543210'));
    await second.api.svc.store.delTemp('otp:cooldown:+919876543210');
    const sent = await second.call('POST', '/auth/send-otp', { body: { phone: '9876543210' } });
    const back = await second.call('POST', '/auth/verify-otp', { body: { phone: '9876543210', otp: sent.devOtp } });
    assert.equal(back.isNewUser, false);
    assert.equal(back.volunteer.id, v.volunteer.id);
    const me = await second.call('GET', '/volunteer/me', { token: back.token });
    assert.equal(me.volunteer.stats.points, 20);
    assert.equal(me.volunteer.standing.city.rank, 1);
    const history = await second.call('GET', '/volunteer/applications', { token: back.token });
    assert.equal(history.applications[0].status, 'completed');
  } finally {
    for (const store of opened) store.close();
    await rm(dir, { recursive: true, force: true });
  }
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
