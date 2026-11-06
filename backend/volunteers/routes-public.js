// Public endpoints behind the OSH website: browsing events, booking tickets, and the
// Organize page's enquiry form. No sign-in needed.
import { randomBytes } from 'node:crypto';
import { byEventDate, eventCounts, eventSummary, eventView } from './service.js';
import {
  CATEGORIES,
  HttpError,
  badRequest,
  cityField,
  email,
  indianMobile,
  isoDate,
  oneOf,
  onlyFields,
  pagination,
  text,
} from './validate.js';

const EVENT_TYPES = ['College fest', 'Concert', 'Corporate event', 'Brand activation', 'Workshop / conference', 'Sports event', 'Other'];
const AUDIENCE_SIZES = ['Under 200', '200 to 1,000', '1,000 to 5,000', 'Over 5,000'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I

function bookingCode() {
  const bytes = randomBytes(6);
  return 'OSH-' + [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export function publicRoutes(define, svc) {
  const { db, store } = svc;

  const bookable = (e) => e.status === 'open' && e.date >= svc.today() && (e.tickets?.length ?? 0) > 0;
  const publicEvent = (e, applications) => ({
    ...eventView(e, { counts: eventCounts(applications.filter((a) => a.eventId === e.id)) }),
    bookable: bookable(e),
  });
  const limitPerHour = async (key, max, message) => {
    if ((await store.incrTemp(key, 3600)) > max) throw new HttpError(429, 'rate_limited', message);
  };

  define(
    'GET',
    '/events',
    { open: true, summary: 'Upcoming events for the public site (?q=&category=&city=)' },
    async ({ query }) => {
      const q = (query.get('q') ?? '').trim().toLowerCase().slice(0, 80);
      const category = oneOf(query.get('category'), 'category', CATEGORIES);
      const city = cityField(query.get('city'));
      const today = svc.today();
      const [events, applications] = await Promise.all([db.all('events'), db.all('applications')]);
      const upcoming = events.filter((e) => e.status === 'open' && e.date >= today);
      const matching = upcoming
        .filter(
          (e) =>
            (!category || e.category === category) &&
            (!city || e.cityKey === city.cityKey) &&
            (!q || [e.title, e.description, e.venue, e.city, e.category, ...(e.tags ?? [])].join(' ').toLowerCase().includes(q)),
        )
        .sort(byEventDate);
      const { limit, offset } = pagination(query);
      return {
        total: matching.length,
        categories: CATEGORIES.filter((c) => upcoming.some((e) => e.category === c)),
        cities: [...new Map(upcoming.map((e) => [e.cityKey, e.city])).values()].sort(),
        events: matching.slice(offset, offset + limit).map((e) => publicEvent(e, applications)),
      };
    },
  );

  define('GET', '/events/:eventId', { open: true, summary: 'One event with its ticket types and highlights' }, async ({ params }) => {
    const event = await svc.requireDoc('events', params.eventId, 'Event');
    const applications = await svc.applicationsWhere((a) => a.eventId === event.id);
    return { event: publicEvent(event, applications) };
  });

  define(
    'POST',
    '/events/:eventId/bookings',
    { open: true, status: 201, summary: 'Book a ticket: { ticketId, name, email, phone }' },
    async ({ params, body, ip }) => {
      onlyFields(body, ['ticketId', 'name', 'email', 'phone']);
      const event = await svc.requireDoc('events', params.eventId, 'Event');
      if (!bookable(event)) throw new HttpError(409, 'bookings_closed', 'Bookings for this event are closed.');
      const ticket = event.tickets.find((t) => t.id === body.ticketId);
      if (!ticket) throw badRequest('invalid_ticket', 'Choose a ticket type.', { field: 'ticketId' });
      const name = text(body.name, 'name', { required: true, max: 80 });
      if (name.length < 2) throw badRequest('invalid_field', 'Enter the attendee\'s full name.', { field: 'name' });
      const attendee = { name, email: email(body.email, { required: true }), phone: indianMobile(body.phone) };
      if (ip) await limitPerHour(`bookings:${ip}`, 30, 'Too many bookings from this network. Try again later.');

      const booking = {
        id: svc.newId('bkg'),
        code: bookingCode(),
        eventId: event.id,
        ticket: { id: ticket.id, name: ticket.name, description: ticket.description ?? null, price: ticket.price },
        attendee,
        amount: ticket.price,
        status: 'confirmed',
        // No payment gateway is connected yet: paid bookings are confirmed without a charge.
        payment: ticket.price > 0 ? 'simulated' : 'free',
        createdAt: svc.nowIso(),
      };
      await db.put('bookings', booking);
      return { booking, event: eventSummary(event) };
    },
  );

  define('GET', '/bookings/:bookingId', { open: true, summary: 'A booking (the id is the proof of purchase)' }, async ({ params }) => {
    const booking = await svc.requireDoc('bookings', params.bookingId, 'Booking');
    const event = await db.get('events', booking.eventId);
    return { booking, event: event && eventSummary(event) };
  });

  define(
    'POST',
    '/organize/enquiries',
    { open: true, status: 201, summary: 'Ask OSH to organise an event (the Organize page form)' },
    async ({ body, ip }) => {
      onlyFields(body, ['name', 'email', 'phone', 'organization', 'eventType', 'city', 'eventDate', 'audience', 'message']);
      const enquiry = {
        id: svc.newId('enq'),
        name: text(body.name, 'name', { required: true, max: 80 }),
        email: email(body.email, { required: true }),
        phone: indianMobile(body.phone),
        organization: text(body.organization, 'organization', { max: 100 }),
        eventType: oneOf(body.eventType, 'eventType', EVENT_TYPES, { required: true }),
        ...(cityField(body.city) ?? { city: null, cityKey: null }),
        eventDate: isoDate(body.eventDate, 'eventDate'),
        audience: oneOf(body.audience, 'audience', AUDIENCE_SIZES),
        message: text(body.message, 'message', { required: true, max: 1500, multiline: true }),
        createdAt: svc.nowIso(),
      };
      if (ip) await limitPerHour(`enquiries:${ip}`, 10, 'Too many enquiries from this network. Try again later.');
      await db.put('enquiries', enquiry);
      return { enquiry: { id: enquiry.id, receivedAt: enquiry.createdAt } };
    },
  );
}
