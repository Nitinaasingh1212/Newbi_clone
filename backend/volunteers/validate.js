// Input checks shared by the routes. Each helper returns the cleaned value or throws an
// HttpError, which the router turns into a JSON error response.
import { LIMITS } from './config.js';

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (code, message, details) => new HttpError(400, code, message, details);

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

function absent(field, required) {
  if (required) throw badRequest('missing_field', `${field} is required.`, { field });
  return null;
}

const invalid = (field, message) => badRequest('invalid_field', message, { field });

export function onlyFields(body, allowed) {
  const unknown = Object.keys(body).filter((k) => !allowed.includes(k));
  if (unknown.length) {
    throw badRequest('unknown_field', `Unexpected field(s): ${unknown.join(', ')}. Allowed: ${allowed.join(', ')}.`, {
      fields: unknown,
    });
  }
}

export function text(value, field, { required = false, max = 120, multiline = false } = {}) {
  if (isBlank(value)) return absent(field, required);
  if (typeof value !== 'string') throw invalid(field, `${field} must be a string.`);
  const cleaned = multiline ? value.trim() : value.trim().replace(/\s+/g, ' ');
  if (cleaned.length > max) throw invalid(field, `${field} must be at most ${max} characters.`);
  return cleaned;
}

export function integer(value, field, { required = false, min, max } = {}) {
  if (isBlank(value)) return absent(field, required);
  const n = typeof value === 'string' ? Number(value.trim()) : value;
  if (!Number.isInteger(n) || n < min || n > max) {
    throw invalid(field, `${field} must be a whole number from ${min} to ${max}.`);
  }
  return n;
}

export function oneOf(value, field, allowed, { required = false } = {}) {
  if (isBlank(value)) return absent(field, required);
  if (!allowed.includes(value)) {
    throw badRequest('invalid_field', `${field} must be one of: ${allowed.join(', ')}.`, { field, allowed });
  }
  return value;
}

// Accepts an array or a comma-separated string. Trims, drops blanks and case-insensitive duplicates.
export function stringList(value, field, { maxItems = 20, maxLength = 40 } = {}) {
  if (isBlank(value)) return [];
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : null;
  if (!items || items.some((item) => typeof item !== 'string')) throw invalid(field, `${field} must be a list of strings.`);
  const seen = new Map();
  for (const item of items) {
    const v = item.trim().replace(/\s+/g, ' ');
    if (!v) continue;
    if (v.length > maxLength) throw invalid(field, `Each ${field} entry must be at most ${maxLength} characters.`);
    if (!seen.has(v.toLowerCase())) seen.set(v.toLowerCase(), v);
  }
  if (seen.size > maxItems) throw invalid(field, `${field} can have at most ${maxItems} entries.`);
  return [...seen.values()];
}

export function isoDate(value, field, { required = false } = {}) {
  if (isBlank(value)) return absent(field, required);
  const m = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!m || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    throw invalid(field, `${field} must be a real date in YYYY-MM-DD format.`);
  }
  return value.trim();
}

export function clockTime(value, field) {
  if (isBlank(value)) return null;
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim())) {
    throw invalid(field, `${field} must be a 24-hour time like 18:30.`);
  }
  return value.trim();
}

export function email(value) {
  if (isBlank(value)) return null;
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    throw badRequest('invalid_email', 'Enter a valid email address.', { field: 'email' });
  }
  return v;
}

// Accepts 9876543210, 09876543210, 919876543210, +91 98765-43210 ... and returns +919876543210.
export function indianMobile(value, field = 'phone') {
  if (isBlank(value)) return absent(field, true);
  const compact = String(value).replace(/[\s\-().]/g, '');
  const m = /^(?:\+91|91|0)?([6-9]\d{9})$/.exec(compact);
  if (!m) throw badRequest('invalid_phone', 'Enter a valid 10-digit Indian mobile number.', { field });
  return `+91${m[1]}`;
}

// Aadhaar numbers are 12 digits, never start with 0 or 1, and end in a Verhoeff check digit.
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function verhoeffValid(digits) {
  let check = 0;
  [...digits].reverse().forEach((d, i) => {
    check = VERHOEFF_D[check][VERHOEFF_P[i % 8][Number(d)]];
  });
  return check === 0;
}

export function aadhaarNumber(value, field = 'aadhaarNumber') {
  if (isBlank(value)) return absent(field, true);
  const digits = String(value).replace(/[\s-]/g, '');
  if (!/^[2-9]\d{11}$/.test(digits) || !verhoeffValid(digits)) {
    throw badRequest('invalid_aadhaar', 'Enter a valid 12-digit Aadhaar number.', { field });
  }
  return digits;
}

export function maskAadhaar(last4) {
  return `XXXX XXXX ${last4}`;
}

// City is the key that decides which events a volunteer sees, so spellings are normalised:
// "New Delhi", "delhi " and "DELHI" all become key "delhi"; old names map to current ones.
const CITY_ALIASES = {
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  ncr: 'delhi',
  bangalore: 'bengaluru',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  gurgaon: 'gurugram',
  poona: 'pune',
  mysore: 'mysuru',
  baroda: 'vadodara',
  cochin: 'kochi',
  trivandrum: 'thiruvananthapuram',
  vizag: 'visakhapatnam',
  allahabad: 'prayagraj',
  banaras: 'varanasi',
  benares: 'varanasi',
  pondicherry: 'puducherry',
};

export function cityKey(value) {
  const words = String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/[\s-]+/g, ' ')
    .trim();
  return (CITY_ALIASES[words] ?? words).replace(/ /g, '-');
}

export function cityField(value, { required = false } = {}) {
  if (isBlank(value)) return absent('city', required);
  if (typeof value !== 'string') throw invalid('city', 'city must be a string.');
  const key = cityKey(value);
  if (key.length < 2 || key.length > 60) throw badRequest('invalid_city', 'Enter a valid city name in English.', { field: 'city' });
  const name = key
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  return { city: name, cityKey: key };
}

export function yearsBetween(fromDate, toDate) {
  const [fy, fm, fd] = fromDate.split('-').map(Number);
  const [ty, tm, td] = toDate.split('-').map(Number);
  return ty - fy - (tm < fm || (tm === fm && td < fd) ? 1 : 0);
}

export function dateOfBirth(value, today) {
  const dob = isoDate(value, 'dateOfBirth', { required: true });
  const age = yearsBetween(dob, today);
  if (age < LIMITS.minVolunteerAge) {
    throw badRequest('too_young', `Volunteers must be at least ${LIMITS.minVolunteerAge} years old.`, { field: 'dateOfBirth' });
  }
  if (age > 100) throw invalid('dateOfBirth', 'Check the date of birth.');
  return dob;
}

export function emergencyContact(value) {
  if (isBlank(value)) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw invalid('emergencyContact', 'emergencyContact must be an object like { "name": "...", "phone": "..." }.');
  }
  return {
    name: text(value.name, 'emergencyContact.name', { required: true, max: 80 }),
    phone: indianMobile(value.phone, 'emergencyContact.phone'),
    relation: text(value.relation, 'emergencyContact.relation', { max: 40 }),
  };
}

export function pagination(query) {
  return {
    limit: integer(query.get('limit'), 'limit', { min: 1, max: 200 }) ?? 50,
    offset: integer(query.get('offset'), 'offset', { min: 0, max: 1_000_000 }) ?? 0,
  };
}
