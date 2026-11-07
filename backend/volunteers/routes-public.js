// Public endpoints behind the OSH website: browsing crew opportunities (events), the
// network numbers, Star Volunteers, vendor registration and volunteer feedback. No sign-in
// needed. OSH is a crew network, not a ticketing platform, so there are no bookings.
import { rankVolunteers } from './ranking.js';
import { byEventDate, eventCounts, eventView, shortName } from './service.js';
import {
  CATEGORIES,
  FEEDBACK_CATEGORIES,
  HttpError,
  VENDOR_CATEGORIES,
  badRequest,
  cityField,
  gstin,
  indianMobile,
  integer,
  oneOf,
  onlyFields,
  pagination,
  text,
} from './validate.js';

const VENDOR_FIELDS = ['companyName', 'contactPerson', 'phone', 'city', 'category', 'gstin', 'services'];
const FEEDBACK_FIELDS = ['category', 'name', 'message'];

export function publicRoutes(define, svc) {
  const { db, store } = svc;

  const isUpcoming = (e, today) => e.status === 'open' && e.date >= today;
  const limitPerHour = async (key, max, message) => {
    if ((await store.incrTemp(key, 3600)) > max) throw new HttpError(429, 'rate_limited', message);
  };
  const countBy = (items, key) => items.reduce((acc, item) => acc.set(key(item), (acc.get(key(item)) ?? 0) + 1), new Map());

  define(
    'GET',
    '/events',
    { open: true, summary: 'Upcoming crew opportunities (?q=&category=&city=), with counts per category and city' },
    async ({ query }) => {
      const q = (query.get('q') ?? '').trim().toLowerCase().slice(0, 80);
      const category = oneOf(query.get('category'), 'category', CATEGORIES);
      const city = cityField(query.get('city'));
      const today = svc.today();
      const [events, applications] = await Promise.all([db.all('events'), db.all('applications')]);
      const upcoming = events.filter((e) => isUpcoming(e, today));
      const matching = upcoming
        .filter(
          (e) =>
            (!category || e.category === category) &&
            (!city || e.cityKey === city.cityKey) &&
            (!q || [e.title, e.description, e.venue, e.city, e.category, ...(e.tags ?? []), ...(e.roles ?? [])].join(' ').toLowerCase().includes(q)),
        )
        .sort(byEventDate);
      const byCategory = countBy(upcoming, (e) => e.category);
      const byCity = countBy(upcoming, (e) => e.cityKey);
      const cityNames = new Map(upcoming.map((e) => [e.cityKey, e.city]));
      const { limit, offset } = pagination(query);
      return {
        total: matching.length,
        categories: CATEGORIES.map((name) => ({ name, count: byCategory.get(name) ?? 0 })),
        cities: [...byCity]
          .map(([cityKey, count]) => ({ city: cityNames.get(cityKey), cityKey, count }))
          .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)),
        events: matching
          .slice(offset, offset + limit)
          .map((e) => eventView(e, { counts: eventCounts(applications.filter((a) => a.eventId === e.id)) })),
      };
    },
  );

  define('GET', '/events/:eventId', { open: true, summary: 'One event with its volunteer roles and open positions' }, async ({ params }) => {
    const event = await svc.requireDoc('events', params.eventId, 'Event');
    const applications = await svc.applicationsWhere((a) => a.eventId === event.id);
    return { event: eventView(event, { counts: eventCounts(applications) }) };
  });

  define('GET', '/stats', { open: true, summary: 'Network numbers: upcoming events, active cities, open positions, interest' }, async () => {
    const today = svc.today();
    const [events, applications, volunteers, vendors] = await Promise.all([
      db.all('events'),
      db.all('applications'),
      db.all('volunteers'),
      db.all('vendors'),
    ]);
    const upcoming = events.filter((e) => isUpcoming(e, today));
    const upcomingIds = new Set(upcoming.map((e) => e.id));
    return {
      upcomingEvents: upcoming.length,
      activeCities: new Set(upcoming.map((e) => e.cityKey)).size,
      volunteerPositions: upcoming.reduce((sum, e) => sum + e.volunteersNeeded, 0),
      interestResponses: applications.filter((a) => upcomingIds.has(a.eventId) && a.status !== 'withdrawn').length,
      volunteers: volunteers.filter((v) => v.status === 'active').length,
      verifiedVendors: vendors.filter((v) => v.status === 'verified').length,
    };
  });

  define(
    'GET',
    '/star-volunteers',
    { open: true, summary: 'Top-ranked volunteers across the network (first name and initial only)' },
    async ({ query }) => {
      const limit = integer(query.get('limit'), 'limit', { min: 1, max: 24 }) ?? 6;
      const snapshot = await svc.rankingSnapshot();
      const ranked = rankVolunteers(snapshot.volunteers, snapshot.statsOf);
      return {
        rankedVolunteers: ranked.length,
        volunteers: ranked.slice(0, limit).map(({ volunteer, stats, rank }) => ({
          rank,
          name: shortName(volunteer.name),
          city: volunteer.city,
          department: volunteer.department ?? null,
          verified: volunteer.kyc.status === 'verified',
          tier: stats.tier,
          points: stats.points,
          completedEvents: stats.completedEvents,
          averageRating: stats.averageRating,
        })),
      };
    },
  );

  define(
    'POST',
    '/vendors',
    { open: true, status: 201, summary: 'Register as a vendor (verified by OSH before listing as a partner)' },
    async ({ body, ip }) => {
      onlyFields(body, VENDOR_FIELDS);
      const companyName = text(body.companyName, 'companyName', { required: true, max: 100 });
      const contactPerson = text(body.contactPerson, 'contactPerson', { required: true, max: 80 });
      if (companyName.length < 2) throw badRequest('invalid_field', 'Enter your company or business name.', { field: 'companyName' });
      if (contactPerson.length < 2) throw badRequest('invalid_field', "Enter the contact person's name.", { field: 'contactPerson' });
      const now = svc.nowIso();
      const vendor = {
        id: svc.newId('ven'),
        companyName,
        contactPerson,
        phone: indianMobile(body.phone),
        ...cityField(body.city, { required: true }),
        category: oneOf(body.category, 'category', VENDOR_CATEGORIES, { required: true }),
        gstin: gstin(body.gstin),
        services: text(body.services, 'services', { max: 1500, multiline: true }),
        status: 'pending',
        reviewNote: null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: now,
        updatedAt: now,
      };
      if (ip) await limitPerHour(`vendors:${ip}`, 10, 'Too many registrations from this network. Try again later.');
      if (!(await store.hsetnx('idx:vendorPhone', vendor.phone, vendor.id))) {
        throw new HttpError(409, 'vendor_exists', 'A vendor with this mobile number is already registered. The OSH team will be in touch.');
      }
      await db.put('vendors', vendor);
      return { vendor: { id: vendor.id, companyName: vendor.companyName, city: vendor.city, category: vendor.category, status: vendor.status } };
    },
  );

  define(
    'POST',
    '/feedback',
    { open: true, status: 201, summary: 'Send feedback to OSH management (name optional; only admins can read it)' },
    async ({ body, ip }) => {
      onlyFields(body, FEEDBACK_FIELDS);
      const message = text(body.message, 'message', { required: true, max: 2000, multiline: true });
      if (message.length < 10) throw badRequest('invalid_field', 'Tell us a little more (at least 10 characters).', { field: 'message' });
      const feedback = {
        id: svc.newId('fbk'),
        category: oneOf(body.category, 'category', FEEDBACK_CATEGORIES, { required: true }),
        name: text(body.name, 'name', { max: 80 }),
        message,
        status: 'new',
        createdAt: svc.nowIso(),
        resolvedAt: null,
        resolvedBy: null,
      };
      if (ip) await limitPerHour(`feedback:${ip}`, 10, 'Too many messages from this network. Try again later.');
      await db.put('feedback', feedback);
      return { feedback: { id: feedback.id, receivedAt: feedback.createdAt } };
    },
  );
}
