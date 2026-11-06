// Data access and response shapes shared by the route files.
import { randomBytes } from 'node:crypto';
import { LIMITS } from './config.js';
import { HttpError, maskAadhaar } from './validate.js';
import { rankVolunteers, statsLookup } from './ranking.js';

export function dateInIndia(date) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LIMITS.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function createService({ config, store, sendSms, now }) {
  const db = {
    async get(collection, id) {
      const raw = await store.hget(collection, id);
      return raw ? JSON.parse(raw) : null;
    },
    async all(collection) {
      return Object.values(await store.hgetall(collection)).map((raw) => JSON.parse(raw));
    },
    async put(collection, doc) {
      await store.hset(collection, doc.id, JSON.stringify(doc));
      return doc;
    },
  };

  return {
    config,
    store,
    sendSms,
    db,
    now,
    nowMs: () => now().getTime(),
    nowIso: () => now().toISOString(),
    today: () => dateInIndia(now()),
    newId: (prefix) => `${prefix}_${randomBytes(9).toString('base64url')}`,

    async requireDoc(collection, id, label) {
      const doc = await db.get(collection, id);
      if (!doc) throw new HttpError(404, 'not_found', `${label} not found.`);
      return doc;
    },

    async applicationsWhere(predicate) {
      return (await db.all('applications')).filter(predicate);
    },

    // Everything the leaderboard and rank lookups need, loaded once per request.
    async rankingSnapshot() {
      const [volunteers, applications] = await Promise.all([db.all('volunteers'), db.all('applications')]);
      return { volunteers, applications, statsOf: statsLookup(applications) };
    },

    // A volunteer's position in their city and overall.
    standing(volunteer, snapshot) {
      const position = (pool) => {
        const ranked = rankVolunteers(pool, snapshot.statsOf);
        return { rank: ranked.find((e) => e.volunteer.id === volunteer.id)?.rank ?? null, rankedVolunteers: ranked.length };
      };
      const city = position(snapshot.volunteers.filter((v) => v.cityKey === volunteer.cityKey));
      return {
        city: { name: volunteer.city, ...city },
        overall: position(snapshot.volunteers),
        ...(city.rank === null && { note: 'Ranks appear after your first reviewed event.' }),
      };
    },
  };
}

export function eventCounts(applications) {
  const counts = { applied: 0, approved: 0, rejected: 0, withdrawn: 0, completed: 0, noShow: 0 };
  for (const app of applications) counts[app.status === 'no_show' ? 'noShow' : app.status]++;
  // Approved, completed and no-show applications each hold one of the event's slots.
  counts.filled = counts.approved + counts.completed + counts.noShow;
  return counts;
}

export const byEventDate = (a, b) =>
  a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '') || a.title.localeCompare(b.title);

export function volunteerView(v, { stats, standing, admin = false } = {}) {
  return {
    id: v.id,
    ...(v.demo && { demo: true }),
    name: v.name,
    phone: v.phone,
    email: v.email,
    dateOfBirth: v.dateOfBirth,
    gender: v.gender,
    city: v.city,
    cityKey: v.cityKey,
    area: v.area,
    skills: v.skills,
    languages: v.languages,
    emergencyContact: v.emergencyContact,
    aadhaar: maskAadhaar(v.aadhaar.last4),
    kyc: {
      status: v.kyc.status,
      note: v.kyc.note,
      reviewedAt: v.kyc.reviewedAt,
      ...(admin && { reviewedBy: v.kyc.reviewedBy }),
    },
    status: v.status,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    ...(stats && { stats }),
    ...(standing && { standing }),
  };
}

// counts: eventCounts() for the event. myApplication: the viewing volunteer's application, if any.
export function eventView(e, { counts, admin = false, myApplication } = {}) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    city: e.city,
    cityKey: e.cityKey,
    venue: e.venue,
    address: e.address,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    roles: e.roles,
    category: e.category ?? null,
    tags: e.tags ?? [],
    highlights: e.highlights ?? [],
    tickets: e.tickets ?? [],
    // Cheapest ticket, or null when the event has no ticket types.
    priceFrom: e.tickets?.length ? Math.min(...e.tickets.map((t) => t.price)) : null,
    image: e.image ?? null,
    imageCredit: e.imageCredit ?? null,
    imageCreditUrl: e.imageCreditUrl ?? null,
    volunteersNeeded: e.volunteersNeeded,
    ...(counts && { slotsLeft: Math.max(0, e.volunteersNeeded - counts.filled) }),
    status: e.status,
    ...(admin
      ? { counts, createdBy: e.createdBy, createdAt: e.createdAt, updatedAt: e.updatedAt }
      : myApplication !== undefined && {
          myApplication: myApplication ? { id: myApplication.id, status: myApplication.status } : null,
        }),
  };
}

export function eventSummary(e) {
  return {
    id: e.id,
    title: e.title,
    city: e.city,
    venue: e.venue,
    address: e.address ?? null,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime ?? null,
    status: e.status,
    category: e.category ?? null,
    image: e.image ?? null,
  };
}

export function applicationView(app, { event, volunteer, admin = false } = {}) {
  return {
    id: app.id,
    eventId: app.eventId,
    volunteerId: app.volunteerId,
    status: app.status,
    preferredRole: app.preferredRole,
    note: app.note,
    appliedAt: app.appliedAt,
    decidedAt: app.decidedAt,
    decisionNote: app.decisionNote,
    withdrawnAt: app.withdrawnAt,
    review: app.review && {
      outcome: app.review.outcome,
      rating: app.review.rating,
      comment: app.review.comment,
      reviewedAt: app.review.reviewedAt,
      ...(admin && { reviewedBy: app.review.reviewedBy }),
    },
    ...(admin && { decidedBy: app.decidedBy }),
    ...(event && { event: eventSummary(event) }),
    ...(volunteer && { volunteer }),
  };
}
