// Volunteer endpoints: OTP sign-in, registration with Aadhaar, profile, events in the
// volunteer's city, applying and withdrawing, and their application history.
import { LIMITS } from './config.js';
import { checkOtp, issueOtp } from './otp.js';
import { keyedHash, signToken } from './tokens.js';
import { applicationView, byEventDate, eventCounts, eventView, volunteerView } from './service.js';
import {
  AVAILABILITY,
  DEPARTMENTS,
  EXPERIENCE_LEVELS,
  GENDERS,
  HttpError,
  aadhaarNumber,
  badRequest,
  cityField,
  dateOfBirth,
  email,
  emergencyContact,
  indianMobile,
  oneOf,
  onlyFields,
  pagination,
  stringList,
  text,
} from './validate.js';

const REGISTER_FIELDS = [
  'name', 'aadhaarNumber', 'dateOfBirth', 'gender', 'city', 'area', 'email', 'department', 'experience', 'availability',
  'skills', 'languages', 'emergencyContact',
];
const PROFILE_FIELDS = REGISTER_FIELDS;
// Changing these after the coordination team has verified the Aadhaar would undo that check.
const KYC_FIELDS = ['name', 'dateOfBirth', 'aadhaarNumber'];

export function volunteerRoutes(define, svc) {
  const { db, store, config } = svc;

  const volunteerToken = (volunteer) => ({
    token: signToken({ sub: volunteer.id, role: 'volunteer' }, config.appSecret, LIMITS.volunteerTokenSeconds, svc.nowMs()),
    expiresInSeconds: LIMITS.volunteerTokenSeconds,
  });
  const aadhaarHash = (number) => keyedHash(config.appSecret, 'aadhaar', number);
  const personName = (value) => {
    const name = text(value, 'name', { required: true, max: 80 });
    if (name.length < 2) throw badRequest('invalid_field', 'name is too short.', { field: 'name' });
    return name;
  };
  // Where storage isn't shared or kept (Vercel without Redis), a change to the demo account
  // would reach only one copy of the function, so the demo is view-only there.
  const demoReadOnly = (volunteer) => Boolean(volunteer.demo) && !store.describe().persistent;
  const assertWritable = (volunteer) => {
    if (demoReadOnly(volunteer)) {
      throw new HttpError(403, 'demo_read_only', 'The demo account is view-only here. Sign up with your own number to apply to events.');
    }
  };
  const cityMismatch = (event, volunteer) =>
    new HttpError(
      403,
      'city_mismatch',
      `This event is in ${event.city}. You can only see and apply to events in your city (${volunteer.city}). Update your city in your profile if you have moved.`,
      { eventCity: event.city, yourCity: volunteer.city },
    );

  // ---- Sign in / sign up -------------------------------------------------------------

  define('POST', '/auth/send-otp', { summary: 'Send a 6-digit OTP to an Indian mobile number' }, async ({ body, ip }) => {
    const phone = indianMobile(body.phone);
    const result = await issueOtp(svc, phone, ip);
    return {
      phone,
      expiresInSeconds: LIMITS.otpTtlSeconds,
      resendAfterSeconds: LIMITS.otpResendSeconds,
      ...(result.devOtp && {
        devOtp: result.devOtp,
        devNote: result.demo
          ? 'This is the demo account; its code is always the same.'
          : 'OTP dev mode is on, so the code is returned here instead of being sent by SMS.',
      }),
    };
  });

  define(
    'POST',
    '/auth/verify-otp',
    { summary: 'Check the OTP. Returns a login token, or a registration token for new numbers' },
    async ({ body }) => {
      const phone = indianMobile(body.phone);
      await checkOtp(svc, phone, body.otp);

      const volunteerId = await store.hget('idx:phone', phone);
      const volunteer = volunteerId && (await db.get('volunteers', volunteerId));
      if (volunteer) {
        if (volunteer.status === 'suspended') {
          throw new HttpError(403, 'account_suspended', 'This volunteer account is suspended. Contact the coordination team.');
        }
        return { isNewUser: false, ...volunteerToken(volunteer), volunteer: volunteerView(volunteer) };
      }
      return {
        isNewUser: true,
        registrationToken: signToken({ role: 'registration', phone }, config.appSecret, LIMITS.registrationTokenSeconds, svc.nowMs()),
        expiresInSeconds: LIMITS.registrationTokenSeconds,
        next: 'POST /api/v1/auth/register with this token as the Bearer token and your details in the body.',
      };
    },
  );

  define(
    'POST',
    '/auth/register',
    { auth: 'registration', status: 201, summary: 'Create the volunteer profile (Aadhaar, city, details) after OTP' },
    async ({ body, auth }) => {
      onlyFields(body, REGISTER_FIELDS);
      const aadhaar = aadhaarNumber(body.aadhaarNumber);
      const now = svc.nowIso();
      const volunteer = {
        id: svc.newId('vol'),
        phone: auth.phone,
        name: personName(body.name),
        email: email(body.email),
        dateOfBirth: dateOfBirth(body.dateOfBirth, svc.today()),
        gender: oneOf(body.gender, 'gender', GENDERS),
        ...cityField(body.city, { required: true }),
        area: text(body.area, 'area', { max: 80 }),
        department: oneOf(body.department, 'department', DEPARTMENTS),
        experience: oneOf(body.experience, 'experience', EXPERIENCE_LEVELS),
        availability: oneOf(body.availability, 'availability', AVAILABILITY),
        skills: stringList(body.skills, 'skills'),
        languages: stringList(body.languages, 'languages', { maxItems: 10 }),
        emergencyContact: emergencyContact(body.emergencyContact),
        aadhaar: { last4: aadhaar.slice(-4), hash: aadhaarHash(aadhaar) },
        kyc: { status: 'pending', note: null, reviewedAt: null, reviewedBy: null },
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      if (!(await store.hsetnx('idx:phone', volunteer.phone, volunteer.id))) {
        throw new HttpError(409, 'already_registered', 'This phone number already has a volunteer account. Sign in instead.');
      }
      if (!(await store.hsetnx('idx:aadhaar', volunteer.aadhaar.hash, volunteer.id))) {
        await store.hdel('idx:phone', volunteer.phone);
        throw new HttpError(409, 'aadhaar_in_use', 'This Aadhaar number is already linked to another volunteer account.');
      }
      await db.put('volunteers', volunteer);
      return { ...volunteerToken(volunteer), volunteer: volunteerView(volunteer) };
    },
  );

  // ---- Profile -----------------------------------------------------------------------

  define('GET', '/volunteer/me', { auth: 'volunteer', summary: 'Your profile, stats, tier and rank' }, async ({ auth }) => {
    const snapshot = await svc.rankingSnapshot();
    const v = auth.volunteer;
    return {
      volunteer: volunteerView(v, { stats: snapshot.statsOf(v.id), standing: svc.standing(v, snapshot) }),
      ...(v.demo && { demoReadOnly: demoReadOnly(v) }),
    };
  });

  define('PATCH', '/volunteer/me', { auth: 'volunteer', summary: 'Update your profile, including your city' }, async ({ body, auth }) => {
    assertWritable(auth.volunteer);
    onlyFields(body, PROFILE_FIELDS);
    const v = structuredClone(auth.volunteer);
    const kycTouched = KYC_FIELDS.filter((f) => f in body);
    if (kycTouched.length && v.kyc.status === 'verified') {
      throw new HttpError(409, 'kyc_locked', `${kycTouched.join(', ')} can't be changed after Aadhaar verification. Contact the coordination team.`);
    }

    if ('name' in body) v.name = personName(body.name);
    if ('dateOfBirth' in body) v.dateOfBirth = dateOfBirth(body.dateOfBirth, svc.today());
    const aadhaar = 'aadhaarNumber' in body ? aadhaarNumber(body.aadhaarNumber) : null;
    if ('email' in body) v.email = email(body.email);
    if ('gender' in body) v.gender = oneOf(body.gender, 'gender', GENDERS);
    if ('city' in body) Object.assign(v, cityField(body.city, { required: true }));
    if ('area' in body) v.area = text(body.area, 'area', { max: 80 });
    if ('department' in body) v.department = oneOf(body.department, 'department', DEPARTMENTS);
    if ('experience' in body) v.experience = oneOf(body.experience, 'experience', EXPERIENCE_LEVELS);
    if ('availability' in body) v.availability = oneOf(body.availability, 'availability', AVAILABILITY);
    if ('skills' in body) v.skills = stringList(body.skills, 'skills');
    if ('languages' in body) v.languages = stringList(body.languages, 'languages', { maxItems: 10 });
    if ('emergencyContact' in body) v.emergencyContact = emergencyContact(body.emergencyContact);

    // Everything is validated; only now move the Aadhaar uniqueness claim.
    if (aadhaar && aadhaarHash(aadhaar) !== v.aadhaar.hash) {
      const hash = aadhaarHash(aadhaar);
      if (!(await store.hsetnx('idx:aadhaar', hash, v.id))) {
        throw new HttpError(409, 'aadhaar_in_use', 'This Aadhaar number is already linked to another volunteer account.');
      }
      await store.hdel('idx:aadhaar', v.aadhaar.hash);
      v.aadhaar = { last4: aadhaar.slice(-4), hash };
    }
    // Fixing details after a rejected verification sends the profile back for review.
    if (kycTouched.length && v.kyc.status === 'rejected') v.kyc = { ...v.kyc, status: 'pending', note: null };
    v.updatedAt = svc.nowIso();

    await db.put('volunteers', v);
    return { volunteer: volunteerView(v) };
  });

  // ---- Events in the volunteer's city ------------------------------------------------

  define(
    'GET',
    '/volunteer/events',
    { auth: 'volunteer', summary: 'Upcoming open events in your city' },
    async ({ auth, query }) => {
      const v = auth.volunteer;
      const today = svc.today();
      const [events, applications] = await Promise.all([db.all('events'), db.all('applications')]);
      const upcoming = events
        .filter((e) => e.cityKey === v.cityKey && e.status === 'open' && e.date >= today)
        .sort(byEventDate);
      const { limit, offset } = pagination(query);
      return {
        city: v.city,
        total: upcoming.length,
        events: upcoming.slice(offset, offset + limit).map((e) => {
          const apps = applications.filter((a) => a.eventId === e.id);
          return eventView(e, { counts: eventCounts(apps), myApplication: apps.find((a) => a.volunteerId === v.id) ?? null });
        }),
      };
    },
  );

  define('GET', '/volunteer/events/:eventId', { auth: 'volunteer', summary: 'One event (in your city, or one you applied to)' }, async ({ auth, params }) => {
    const v = auth.volunteer;
    const event = await svc.requireDoc('events', params.eventId, 'Event');
    const apps = await svc.applicationsWhere((a) => a.eventId === event.id);
    const mine = apps.find((a) => a.volunteerId === v.id) ?? null;
    if (event.cityKey !== v.cityKey && !mine) throw cityMismatch(event, v);
    return { event: eventView(event, { counts: eventCounts(apps), myApplication: mine }) };
  });

  define(
    'POST',
    '/volunteer/events/:eventId/apply',
    { auth: 'volunteer', status: 201, summary: 'Apply to work an event in your city' },
    async ({ auth, params, body }) => {
      const v = auth.volunteer;
      assertWritable(v);
      const event = await svc.requireDoc('events', params.eventId, 'Event');
      if (event.cityKey !== v.cityKey) throw cityMismatch(event, v);
      if (event.status !== 'open') {
        throw new HttpError(409, 'event_not_open', `This event is ${event.status} and isn't taking applications.`);
      }
      if (event.date < svc.today()) throw new HttpError(409, 'event_past', 'This event has already happened.');
      if (v.kyc.status === 'rejected') {
        throw new HttpError(403, 'kyc_rejected', 'Your Aadhaar verification was rejected. Fix your details in your profile or contact the coordination team.');
      }

      const apps = await svc.applicationsWhere((a) => a.eventId === event.id);
      const existing = apps.find((a) => a.volunteerId === v.id);
      if (existing && existing.status !== 'withdrawn') {
        throw new HttpError(409, 'already_applied', `You have already applied to this event (status: ${existing.status}).`, {
          applicationId: existing.id,
          status: existing.status,
        });
      }
      if (eventCounts(apps).filled >= event.volunteersNeeded) {
        throw new HttpError(409, 'event_full', 'All volunteer slots for this event are filled.');
      }
      const preferredRole = text(body.preferredRole, 'preferredRole', { max: 60 });
      if (preferredRole && event.roles.length && !event.roles.some((r) => r.toLowerCase() === preferredRole.toLowerCase())) {
        throw badRequest('invalid_field', `preferredRole must be one of: ${event.roles.join(', ')}.`, { field: 'preferredRole' });
      }

      const now = svc.nowIso();
      const fresh = { status: 'applied', preferredRole, note: text(body.note, 'note', { max: 300, multiline: true }), appliedAt: now };
      const reset = { decidedAt: null, decidedBy: null, decisionNote: null, withdrawnAt: null, review: null, updatedAt: now };
      // Re-applying after withdrawing reuses the same application.
      const app = existing
        ? { ...existing, ...fresh, ...reset }
        : { id: svc.newId('app'), eventId: event.id, volunteerId: v.id, ...fresh, ...reset };
      if (!existing && !(await store.hsetnx('idx:application', `${event.id}:${v.id}`, app.id))) {
        throw new HttpError(409, 'already_applied', 'You have already applied to this event.');
      }
      await db.put('applications', app);
      return { application: applicationView(app, { event }) };
    },
  );

  define(
    'POST',
    '/volunteer/events/:eventId/withdraw',
    { auth: 'volunteer', summary: 'Withdraw your application before the event' },
    async ({ auth, params }) => {
      const v = auth.volunteer;
      assertWritable(v);
      const event = await svc.requireDoc('events', params.eventId, 'Event');
      const appId = await store.hget('idx:application', `${event.id}:${v.id}`);
      const app = appId && (await db.get('applications', appId));
      if (!app) throw new HttpError(404, 'not_found', "You haven't applied to this event.");
      if (!['applied', 'approved'].includes(app.status)) {
        throw new HttpError(409, 'cannot_withdraw', `This application is ${app.status} and can't be withdrawn.`);
      }
      if (event.date < svc.today()) throw new HttpError(409, 'event_past', 'This event has already happened.');
      Object.assign(app, { status: 'withdrawn', withdrawnAt: svc.nowIso(), updatedAt: svc.nowIso() });
      await db.put('applications', app);
      return { application: applicationView(app, { event }) };
    },
  );

  define(
    'GET',
    '/volunteer/applications',
    { auth: 'volunteer', summary: 'Your applications with their status and ratings (?status=)' },
    async ({ auth, query }) => {
      const status = oneOf(query.get('status'), 'status', ['applied', 'approved', 'rejected', 'withdrawn', 'completed', 'no_show']);
      const [apps, events] = await Promise.all([
        svc.applicationsWhere((a) => a.volunteerId === auth.volunteer.id && (!status || a.status === status)),
        db.all('events'),
      ]);
      const eventsById = new Map(events.map((e) => [e.id, e]));
      const { limit, offset } = pagination(query);
      const sorted = apps.sort((a, b) => byEventDate(eventsById.get(b.eventId), eventsById.get(a.eventId)));
      return {
        total: sorted.length,
        applications: sorted.slice(offset, offset + limit).map((a) => applicationView(a, { event: eventsById.get(a.eventId) })),
      };
    },
  );
}
