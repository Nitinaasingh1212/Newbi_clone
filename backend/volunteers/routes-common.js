// Endpoints used by everyone: service health, form options, the city list, ranking rules
// and the leaderboard.
import { configProblem } from './config.js';
import { rankVolunteers, rankingRules } from './ranking.js';
import { shortName } from './service.js';
import {
  AVAILABILITY,
  CATEGORIES,
  DEPARTMENTS,
  EXPERIENCE_LEVELS,
  FEEDBACK_CATEGORIES,
  NETWORK_CITIES,
  VENDOR_CATEGORIES,
  cityField,
  integer,
} from './validate.js';
import { DEMO_LOGIN } from './demo-data.js';

export function commonRoutes(define, svc) {
  const { config, db, store } = svc;

  define('GET', '/health', { open: true, summary: 'Service status and setup warnings' }, () => {
    const storage = store.describe();
    const problem = configProblem(config);
    const warnings = [];
    if (problem) warnings.push(problem);
    if (!config.adminApiKey) warnings.push('ADMIN_API_KEY is not set, so admin sign-in is disabled.');
    if (storage.kind === 'file' && config.sqliteFile) {
      warnings.push('SQLite is not available (better-sqlite3 is not installed), so data is in a JSON file. Run npm install.');
    }
    if (!storage.persistent) {
      warnings.push('No Redis configured: accounts and events reset whenever the server restarts. Set KV_REST_API_URL and KV_REST_API_TOKEN (Upstash Redis) to keep them.');
    }
    if (config.production && config.usingPrototypeSecrets) {
      warnings.push('Using the prototype APP_SECRET / ADMIN_API_KEY hardcoded in backend/volunteers/config.js. The repository is public, so set your own in Vercel before real volunteers sign up.');
    }
    if (config.production && config.otpDevMode) {
      warnings.push('OTP dev mode is on: OTPs are shown in the API response, so anyone can sign in as any number. Set up Twilio before real use.');
    }
    if (!config.otpDevMode && !svc.sendSms) warnings.push('No SMS provider is configured and OTP_DEV_MODE is off, so OTPs cannot be sent.');
    return {
      status: problem ? 'misconfigured' : 'ok',
      prototype: config.usingPrototypeSecrets,
      storage: { kind: storage.kind, persistent: storage.persistent },
      otpDelivery: config.otpDevMode ? 'dev-mode' : svc.sendSms ? 'sms' : 'unavailable',
      ...(config.demoMode && {
        demoLogin: { phone: `${DEMO_LOGIN.phone.slice(3, 8)} ${DEMO_LOGIN.phone.slice(8)}`, otp: DEMO_LOGIN.otp },
      }),
      today: svc.today(),
      warnings,
    };
  });

  define('GET', '/options', { open: true, summary: 'Choice lists for the site forms (categories, departments, cities, ...)' }, () => ({
    categories: CATEGORIES,
    networkCities: NETWORK_CITIES,
    departments: DEPARTMENTS,
    experienceLevels: EXPERIENCE_LEVELS,
    availability: AVAILABILITY,
    vendorCategories: VENDOR_CATEGORIES,
    feedbackCategories: FEEDBACK_CATEGORIES,
  }));

  define(
    'GET',
    '/cities',
    { open: true, summary: 'Cities that have volunteers or events, with upcoming event counts' },
    async () => {
      const today = svc.today();
      const cities = new Map();
      const entry = (doc) => {
        if (!cities.has(doc.cityKey)) cities.set(doc.cityKey, { city: doc.city, cityKey: doc.cityKey, upcomingEvents: 0 });
        return cities.get(doc.cityKey);
      };
      for (const e of await db.all('events')) {
        const c = entry(e);
        if (e.status === 'open' && e.date >= today) c.upcomingEvents++;
      }
      for (const v of await db.all('volunteers')) entry(v);
      return {
        cities: [...cities.values()].sort((a, b) => b.upcomingEvents - a.upcomingEvents || a.city.localeCompare(b.city)),
      };
    },
  );

  define('GET', '/ranking/rules', { open: true, summary: 'How points, tiers and rank are calculated' }, () => ({
    rules: rankingRules(),
  }));

  define(
    'GET',
    '/leaderboard',
    { auth: 'any', summary: "Ranked volunteers. Volunteers default to their own city; ?city=all for everyone" },
    async ({ query, auth }) => {
      const isAdmin = auth.role === 'admin';
      const cityParam = query.get('city')?.trim();
      let scope = null; // null = all cities
      if (cityParam && cityParam.toLowerCase() !== 'all') scope = cityField(cityParam);
      else if (!cityParam && !isAdmin) scope = { city: auth.volunteer.city, cityKey: auth.volunteer.cityKey };
      const limit = integer(query.get('limit'), 'limit', { min: 1, max: 200 }) ?? 50;

      const snapshot = await svc.rankingSnapshot();
      const pool = scope ? snapshot.volunteers.filter((v) => v.cityKey === scope.cityKey) : snapshot.volunteers;
      const ranked = rankVolunteers(pool, snapshot.statsOf);
      const row = ({ volunteer, stats, rank }) => ({
        rank,
        ...(isAdmin
          ? { volunteerId: volunteer.id, name: volunteer.name }
          : { name: shortName(volunteer.name), isYou: volunteer.id === auth.volunteer.id }),
        city: volunteer.city,
        tier: stats.tier,
        points: stats.points,
        completedEvents: stats.completedEvents,
        averageRating: stats.averageRating,
        reliability: stats.reliability,
      });
      const you = !isAdmin && ranked.find((e) => e.volunteer.id === auth.volunteer.id);
      return {
        scope: scope ? scope.city : 'All cities',
        rankedVolunteers: ranked.length,
        leaderboard: ranked.slice(0, limit).map(row),
        ...(!isAdmin && { you: you ? row(you) : null }),
      };
    },
  );
}
