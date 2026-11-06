// Admin / coordination-team endpoints: sign in with the admin API key, manage events per
// city, approve or reject applicants, rate volunteers after an event, and review volunteer
// KYC (Aadhaar) and account status.
import { LIMITS } from './config.js';
import { keyedHash, safeEqual, signToken } from './tokens.js';
import { applicationView, byEventDate, eventCounts, eventView, volunteerView } from './service.js';
import {
  CATEGORIES,
  HttpError,
  badRequest,
  tickets,
  cityField,
  clockTime,
  imageUrl,
  integer,
  isoDate,
  oneOf,
  onlyFields,
  pagination,
  stringList,
  text,
} from './validate.js';

const EVENT_FIELDS = [
  'title', 'description', 'city', 'venue', 'address', 'date', 'startTime', 'endTime', 'roles', 'volunteersNeeded', 'status',
  'image', 'imageCredit', 'imageCreditUrl', 'category', 'tags', 'highlights', 'tickets',
];
const EVENT_STATUSES = ['open', 'closed', 'completed', 'cancelled'];
const APPLICATION_STATUSES = ['applied', 'approved', 'rejected', 'withdrawn', 'completed', 'no_show'];
// Order applicants are listed in for an event: pending first, then the confirmed team.
const STATUS_ORDER = { applied: 0, approved: 1, completed: 2, no_show: 3, rejected: 4, withdrawn: 5 };

function readEventFields(body, { creating }) {
  const has = (field) => creating || field in body;
  const out = {};
  if (has('title')) out.title = text(body.title, 'title', { required: true, max: 120 });
  if (has('description')) out.description = text(body.description, 'description', { max: 2000, multiline: true });
  if (has('city')) Object.assign(out, cityField(body.city, { required: true }));
  if (has('venue')) out.venue = text(body.venue, 'venue', { required: true, max: 120 });
  if (has('address')) out.address = text(body.address, 'address', { max: 250 });
  if (has('date')) out.date = isoDate(body.date, 'date', { required: true });
  if (has('startTime')) out.startTime = clockTime(body.startTime, 'startTime');
  if (has('endTime')) out.endTime = clockTime(body.endTime, 'endTime');
  if (has('roles')) out.roles = stringList(body.roles, 'roles', { maxLength: 60 });
  if (has('volunteersNeeded')) {
    out.volunteersNeeded = integer(body.volunteersNeeded, 'volunteersNeeded', { required: true, min: 1, max: 5000 });
  }
  if (has('status')) out.status = oneOf(body.status, 'status', EVENT_STATUSES, { required: !creating }) ?? 'open';
  if (has('image')) out.image = imageUrl(body.image);
  if (has('imageCredit')) out.imageCredit = text(body.imageCredit, 'imageCredit', { max: 160 });
  if (has('imageCreditUrl')) out.imageCreditUrl = imageUrl(body.imageCreditUrl, 'imageCreditUrl');
  if (has('category')) out.category = oneOf(body.category, 'category', CATEGORIES);
  if (has('tags')) out.tags = stringList(body.tags, 'tags', { maxItems: 8, maxLength: 30 });
  if (has('highlights')) out.highlights = stringList(body.highlights, 'highlights', { maxItems: 8, maxLength: 40 });
  if (has('tickets')) out.tickets = tickets(body.tickets);
  return out;
}

export function adminRoutes(define, svc) {
  const { db, store, config } = svc;
  const adminName = (auth) => auth.admin.name;

  // A volunteer as shown inside admin lists: contact, KYC and ranking at a glance.
  const volunteerBrief = (v, stats) => ({
    id: v.id,
    name: v.name,
    phone: v.phone,
    city: v.city,
    kycStatus: v.kyc.status,
    status: v.status,
    points: stats.points,
    tier: stats.tier,
    completedEvents: stats.completedEvents,
    noShows: stats.noShows,
    averageRating: stats.averageRating,
  });

  define('POST', '/admin/login', { summary: 'Exchange the admin API key for a coordinator token' }, async ({ body, ip }) => {
    if (!config.adminApiKey) throw new HttpError(503, 'not_configured', 'ADMIN_API_KEY is not set on the server.');
    if (ip && (await store.incrTemp(`admin-login:${ip}`, 15 * 60)) > LIMITS.adminLoginAttemptsPer15Min) {
      throw new HttpError(429, 'too_many_attempts', 'Too many sign-in attempts. Try again in 15 minutes.');
    }
    const name = text(body.name, 'name', { required: true, max: 60 });
    const hashed = (key) => keyedHash(config.appSecret, 'admin-key', key);
    if (typeof body.apiKey !== 'string' || !safeEqual(hashed(body.apiKey), hashed(config.adminApiKey))) {
      throw new HttpError(401, 'invalid_api_key', 'Wrong admin API key.');
    }
    return {
      token: signToken({ sub: 'admin', role: 'admin', name }, config.appSecret, LIMITS.adminTokenSeconds, svc.nowMs()),
      expiresInSeconds: LIMITS.adminTokenSeconds,
      admin: { name },
    };
  });

  // ---- Events ------------------------------------------------------------------------

  define(
    'GET',
    '/admin/events',
    { auth: 'admin', summary: 'List events (?city=&status=&from=&to=)' },
    async ({ query }) => {
      const city = cityField(query.get('city'));
      const status = oneOf(query.get('status'), 'status', EVENT_STATUSES);
      const from = isoDate(query.get('from'), 'from');
      const to = isoDate(query.get('to'), 'to');
      const [events, applications] = await Promise.all([db.all('events'), db.all('applications')]);
      const matching = events
        .filter(
          (e) =>
            (!city || e.cityKey === city.cityKey) &&
            (!status || e.status === status) &&
            (!from || e.date >= from) &&
            (!to || e.date <= to),
        )
        .sort(byEventDate);
      const { limit, offset } = pagination(query);
      return {
        total: matching.length,
        events: matching.slice(offset, offset + limit).map((e) =>
          eventView(e, { admin: true, counts: eventCounts(applications.filter((a) => a.eventId === e.id)) }),
        ),
      };
    },
  );

  define('POST', '/admin/events', { auth: 'admin', status: 201, summary: 'Create an event in a city' }, async ({ body, auth }) => {
    onlyFields(body, EVENT_FIELDS);
    const fields = readEventFields(body, { creating: true });
    if (fields.date < svc.today()) throw badRequest('date_in_past', 'The event date is in the past.', { field: 'date' });
    const now = svc.nowIso();
    const event = { id: svc.newId('evt'), ...fields, createdBy: adminName(auth), createdAt: now, updatedAt: now };
    await db.put('events', event);
    return { event: eventView(event, { admin: true, counts: eventCounts([]) }) };
  });

  define('GET', '/admin/events/:eventId', { auth: 'admin', summary: 'One event with applicant counts' }, async ({ params }) => {
    const event = await svc.requireDoc('events', params.eventId, 'Event');
    const apps = await svc.applicationsWhere((a) => a.eventId === event.id);
    return { event: eventView(event, { admin: true, counts: eventCounts(apps) }) };
  });

  define(
    'PATCH',
    '/admin/events/:eventId',
    { auth: 'admin', summary: 'Edit an event or change its status (open/closed/completed/cancelled)' },
    async ({ params, body }) => {
      onlyFields(body, EVENT_FIELDS);
      const event = await svc.requireDoc('events', params.eventId, 'Event');
      const fields = readEventFields(body, { creating: false });
      const apps = await svc.applicationsWhere((a) => a.eventId === event.id);
      if (fields.cityKey && fields.cityKey !== event.cityKey && apps.length) {
        throw new HttpError(409, 'city_locked', `Volunteers from ${event.city} have already applied, so the city can't change. Create a new event instead.`);
      }
      const { filled } = eventCounts(apps);
      if (fields.volunteersNeeded !== undefined && fields.volunteersNeeded < filled) {
        throw new HttpError(409, 'below_filled', `${filled} volunteers are already confirmed, so volunteersNeeded can't be lower than that.`);
      }
      Object.assign(event, fields, { updatedAt: svc.nowIso() });
      await db.put('events', event);
      return { event: eventView(event, { admin: true, counts: eventCounts(apps) }) };
    },
  );

  define(
    'GET',
    '/admin/events/:eventId/applications',
    { auth: 'admin', summary: "Applicants for an event with each volunteer's KYC, points and rating (?status=)" },
    async ({ params, query }) => {
      const event = await svc.requireDoc('events', params.eventId, 'Event');
      const status = oneOf(query.get('status'), 'status', APPLICATION_STATUSES);
      const snapshot = await svc.rankingSnapshot();
      const volunteersById = new Map(snapshot.volunteers.map((v) => [v.id, v]));
      const apps = snapshot.applications
        .filter((a) => a.eventId === event.id && (!status || a.status === status))
        .map((a) => ({ app: a, volunteer: volunteersById.get(a.volunteerId), stats: snapshot.statsOf(a.volunteerId) }))
        .sort(
          (x, y) =>
            STATUS_ORDER[x.app.status] - STATUS_ORDER[y.app.status] ||
            y.stats.points - x.stats.points ||
            x.app.appliedAt.localeCompare(y.app.appliedAt),
        );
      return {
        event: eventView(event, { admin: true, counts: eventCounts(snapshot.applications.filter((a) => a.eventId === event.id)) }),
        applications: apps.map(({ app, volunteer, stats }) =>
          applicationView(app, { admin: true, volunteer: volunteer && volunteerBrief(volunteer, stats) }),
        ),
      };
    },
  );

  // ---- Applications ------------------------------------------------------------------

  define(
    'POST',
    '/admin/applications/:applicationId/decision',
    { auth: 'admin', summary: 'Approve or reject an applicant ({ decision: "approve" | "reject", note })' },
    async ({ params, body, auth }) => {
      const app = await svc.requireDoc('applications', params.applicationId, 'Application');
      const decision = oneOf(body.decision, 'decision', ['approve', 'reject'], { required: true });
      const note = text(body.note, 'note', { max: 300, multiline: true });
      if (!['applied', 'approved', 'rejected'].includes(app.status)) {
        throw new HttpError(409, 'not_decidable', `This application is ${app.status}; only pending, approved or rejected ones can be changed.`);
      }
      const [event, volunteer] = await Promise.all([
        svc.requireDoc('events', app.eventId, 'Event'),
        svc.requireDoc('volunteers', app.volunteerId, 'Volunteer'),
      ]);

      if (decision === 'approve' && app.status !== 'approved') {
        if (volunteer.kyc.status !== 'verified') {
          throw new HttpError(409, 'kyc_not_verified', `Verify ${volunteer.name}'s Aadhaar first (PATCH /api/v1/admin/volunteers/${volunteer.id} with kycStatus "verified").`);
        }
        if (volunteer.status !== 'active') throw new HttpError(409, 'volunteer_suspended', 'This volunteer is suspended.');
        if (['completed', 'cancelled'].includes(event.status)) throw new HttpError(409, 'event_closed', `This event is ${event.status}.`);
        const { filled } = eventCounts(await svc.applicationsWhere((a) => a.eventId === event.id));
        if (filled >= event.volunteersNeeded) {
          throw new HttpError(409, 'event_full', `All ${event.volunteersNeeded} slots are filled. Raise volunteersNeeded on the event to approve more.`);
        }
      }

      const now = svc.nowIso();
      Object.assign(app, {
        status: decision === 'approve' ? 'approved' : 'rejected',
        decidedAt: now,
        decidedBy: adminName(auth),
        decisionNote: note,
        updatedAt: now,
      });
      await db.put('applications', app);
      return { application: applicationView(app, { admin: true, event }) };
    },
  );

  define(
    'POST',
    '/admin/applications/:applicationId/review',
    { auth: 'admin', summary: 'After the event: mark completed with a 1-5 rating, or no_show' },
    async ({ params, body, auth }) => {
      const app = await svc.requireDoc('applications', params.applicationId, 'Application');
      const outcome = oneOf(body.outcome, 'outcome', ['completed', 'no_show'], { required: true });
      const rating = outcome === 'completed' ? integer(body.rating, 'rating', { required: true, min: 1, max: 5 }) : null;
      const comment = text(body.comment, 'comment', { max: 500, multiline: true });
      if (!['approved', 'completed', 'no_show'].includes(app.status)) {
        throw new HttpError(409, 'not_reviewable', `Only approved volunteers can be reviewed; this application is ${app.status}.`);
      }
      const event = await svc.requireDoc('events', app.eventId, 'Event');
      if (event.date > svc.today()) {
        throw new HttpError(409, 'event_not_started', `Volunteers can be reviewed from the event date (${event.date}).`);
      }

      const now = svc.nowIso();
      Object.assign(app, {
        status: outcome,
        review: { outcome, rating, comment, reviewedBy: adminName(auth), reviewedAt: now },
        updatedAt: now,
      });
      await db.put('applications', app);
      const snapshot = await svc.rankingSnapshot();
      return { application: applicationView(app, { admin: true, event }), volunteerStats: snapshot.statsOf(app.volunteerId) };
    },
  );

  // ---- Volunteers --------------------------------------------------------------------

  define(
    'GET',
    '/admin/volunteers',
    { auth: 'admin', summary: 'List volunteers (?city=&kycStatus=&status=&q=&sort=newest|points)' },
    async ({ query }) => {
      const city = cityField(query.get('city'));
      const kycStatus = oneOf(query.get('kycStatus'), 'kycStatus', ['pending', 'verified', 'rejected']);
      const status = oneOf(query.get('status'), 'status', ['active', 'suspended']);
      const sort = oneOf(query.get('sort'), 'sort', ['newest', 'points']) ?? 'newest';
      const q = (query.get('q') ?? '').trim().toLowerCase();
      const snapshot = await svc.rankingSnapshot();
      const matching = snapshot.volunteers
        .filter(
          (v) =>
            (!city || v.cityKey === city.cityKey) &&
            (!kycStatus || v.kyc.status === kycStatus) &&
            (!status || v.status === status) &&
            (!q || v.name.toLowerCase().includes(q) || v.phone.includes(q) || v.aadhaar.last4 === q),
        )
        .map((v) => ({ v, stats: snapshot.statsOf(v.id) }))
        .sort((a, b) =>
          sort === 'points' ? b.stats.points - a.stats.points || b.v.createdAt.localeCompare(a.v.createdAt) : b.v.createdAt.localeCompare(a.v.createdAt),
        );
      const { limit, offset } = pagination(query);
      return {
        total: matching.length,
        volunteers: matching.slice(offset, offset + limit).map(({ v, stats }) => volunteerView(v, { admin: true, stats })),
      };
    },
  );

  define(
    'GET',
    '/admin/volunteers/:volunteerId',
    { auth: 'admin', summary: 'Full volunteer profile with stats, rank and event history' },
    async ({ params }) => {
      const volunteer = await svc.requireDoc('volunteers', params.volunteerId, 'Volunteer');
      const [snapshot, events] = await Promise.all([svc.rankingSnapshot(), db.all('events')]);
      const eventsById = new Map(events.map((e) => [e.id, e]));
      const history = snapshot.applications
        .filter((a) => a.volunteerId === volunteer.id)
        .sort((a, b) => byEventDate(eventsById.get(b.eventId), eventsById.get(a.eventId)));
      return {
        volunteer: volunteerView(volunteer, {
          admin: true,
          stats: snapshot.statsOf(volunteer.id),
          standing: svc.standing(volunteer, snapshot),
        }),
        applications: history.map((a) => applicationView(a, { admin: true, event: eventsById.get(a.eventId) })),
      };
    },
  );

  define(
    'PATCH',
    '/admin/volunteers/:volunteerId',
    { auth: 'admin', summary: 'Set Aadhaar KYC status (pending/verified/rejected) or suspend/reactivate' },
    async ({ params, body, auth }) => {
      onlyFields(body, ['kycStatus', 'kycNote', 'status']);
      const volunteer = await svc.requireDoc('volunteers', params.volunteerId, 'Volunteer');
      const kycStatus = oneOf(body.kycStatus, 'kycStatus', ['pending', 'verified', 'rejected']);
      const status = oneOf(body.status, 'status', ['active', 'suspended']);
      const now = svc.nowIso();
      if (kycStatus || 'kycNote' in body) {
        volunteer.kyc = {
          status: kycStatus ?? volunteer.kyc.status,
          note: text(body.kycNote, 'kycNote', { max: 300 }),
          reviewedAt: now,
          reviewedBy: adminName(auth),
        };
      }
      if (status) volunteer.status = status;
      volunteer.updatedAt = now;
      await db.put('volunteers', volunteer);
      return { volunteer: volunteerView(volunteer, { admin: true }) };
    },
  );

  // ---- Ticket bookings and organiser enquiries --------------------------------------

  define('GET', '/admin/events/:eventId/bookings', { auth: 'admin', summary: 'Ticket bookings for an event' }, async ({ params }) => {
    const event = await svc.requireDoc('events', params.eventId, 'Event');
    const bookings = (await db.all('bookings'))
      .filter((b) => b.eventId === event.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      event: eventView(event, { admin: true }),
      total: bookings.length,
      byTicket: Object.values(
        bookings.reduce((acc, b) => {
          acc[b.ticket.id] ??= { ticket: b.ticket.name, bookings: 0, amount: 0 };
          acc[b.ticket.id].bookings++;
          acc[b.ticket.id].amount += b.amount;
          return acc;
        }, {}),
      ),
      bookings,
    };
  });

  define('GET', '/admin/enquiries', { auth: 'admin', summary: 'Event enquiries from the Organize page, newest first' }, async ({ query }) => {
    const enquiries = (await db.all('enquiries')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const { limit, offset } = pagination(query);
    return { total: enquiries.length, enquiries: enquiries.slice(offset, offset + limit) };
  });
}
