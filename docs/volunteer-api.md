# Volunteer API

The volunteer API serves the on-ground volunteers and workers who help the coordination team at events. Volunteers sign up with their phone (OTP) and Aadhaar, and they see and apply to events in **their city only**. After each event, the coordination team rates them, and those ratings feed a points-based ranking.

- **Volunteer UI:** https://newbi-clone.vercel.app/volunteer (`site/volunteer/index.html`) is built on these endpoints.
- **Base URL:** `https://newbi-clone.vercel.app/api/v1` (locally `http://localhost:3000/api/v1`)
- **Format:** JSON in, JSON out. Every response has `success: true|false`.
- **Auth:** `Authorization: Bearer <token>`. Volunteers get a token from the OTP flow. Admins get one from `/admin/login`.
- `GET /api/v1` lists every endpoint. `GET /api/v1/health` reports what's configured.

## How it fits together

```
Volunteer                                   Coordination team (admin)
---------                                   -------------------------
POST /auth/send-otp      phone
POST /auth/verify-otp    phone + otp  ──►  new number? → registrationToken
POST /auth/register      Aadhaar, city…    returning?  → token
                                            POST /admin/login            → admin token
                                            POST /admin/events           event in a city
GET  /volunteer/events   ◄── only events in the volunteer's city
POST /volunteer/events/:id/apply
                                            PATCH /admin/volunteers/:id  kycStatus: verified
                                            POST  /admin/applications/:id/decision  approve
            … event day …
                                            POST  /admin/applications/:id/review    completed + 1–5★ / no_show
GET  /volunteer/me       points, tier, rank in city
GET  /leaderboard        city leaderboard
```

## Endpoints

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/api/v1` | — | List of endpoints |
| GET | `/api/v1/health` | — | Status and setup warnings |
| GET | `/api/v1/cities` | — | Cities with volunteers/events and upcoming event counts |
| GET | `/api/v1/ranking/rules` | — | How points, tiers and rank work |
| GET | `/api/v1/leaderboard` | volunteer or admin | Ranking for a city (`?city=`) or everyone (`?city=all`) |
| **Volunteer** | | | |
| POST | `/api/v1/auth/send-otp` | — | Send an OTP to a mobile number |
| POST | `/api/v1/auth/verify-otp` | — | Check the OTP and get a login or registration token |
| POST | `/api/v1/auth/register` | registration | Create the profile (Aadhaar, DOB, city, …) |
| GET | `/api/v1/volunteer/me` | volunteer | Profile, stats, tier, city rank |
| PATCH | `/api/v1/volunteer/me` | volunteer | Update profile (including city) |
| GET | `/api/v1/volunteer/events` | volunteer | Upcoming open events **in my city** |
| GET | `/api/v1/volunteer/events/:eventId` | volunteer | One event |
| POST | `/api/v1/volunteer/events/:eventId/apply` | volunteer | Apply to work the event |
| POST | `/api/v1/volunteer/events/:eventId/withdraw` | volunteer | Withdraw before the event |
| GET | `/api/v1/volunteer/applications` | volunteer | My applications, statuses and ratings |
| **Admin / coordination team** | | | |
| POST | `/api/v1/admin/login` | — | Admin API key → admin token |
| GET | `/api/v1/admin/events` | admin | List events (`?city=&status=&from=&to=`) |
| POST | `/api/v1/admin/events` | admin | Create an event in a city |
| GET | `/api/v1/admin/events/:eventId` | admin | One event with applicant counts |
| PATCH | `/api/v1/admin/events/:eventId` | admin | Edit, close, complete or cancel an event |
| GET | `/api/v1/admin/events/:eventId/applications` | admin | Applicants with KYC status, points and rating |
| POST | `/api/v1/admin/applications/:applicationId/decision` | admin | Approve or reject an applicant |
| POST | `/api/v1/admin/applications/:applicationId/review` | admin | After the event: completed + rating, or no-show |
| GET | `/api/v1/admin/volunteers` | admin | Search volunteers (`?city=&kycStatus=&status=&q=&sort=`) |
| GET | `/api/v1/admin/volunteers/:volunteerId` | admin | Full profile, stats, rank and history |
| PATCH | `/api/v1/admin/volunteers/:volunteerId` | admin | Verify/reject Aadhaar KYC, suspend/reactivate |

List endpoints accept `?limit=` (1–200, default 50) and `?offset=`.

---

## Volunteer sign-up and sign-in

### `POST /auth/send-otp`

```json
{ "phone": "98765 43210" }
```

Any common Indian format works (`9876543210`, `09876543210`, `+91 98765-43210`). Numbers are stored as `+919876543210`.

```json
{
  "success": true,
  "phone": "+919876543210",
  "expiresInSeconds": 300,
  "resendAfterSeconds": 30,
  "devOtp": "323037",
  "devNote": "OTP dev mode is on, so the code is returned here instead of being sent by SMS."
}
```

`devOtp` only appears in dev mode, which is the prototype default until Twilio is configured (see [Setup](#setup)). With SMS configured, the code is texted instead.

Limits: one code per 30 s per number, 5 per hour per number, 30 per hour per IP. A code is valid for 5 minutes, allows 5 wrong guesses, and works once.

### `POST /auth/verify-otp`

```json
{ "phone": "9876543210", "otp": "323037" }
```

**New number:** you get a short-lived (15 min) registration token.

```json
{
  "success": true,
  "isNewUser": true,
  "registrationToken": "eyJhbGciOi…",
  "expiresInSeconds": 900,
  "next": "POST /api/v1/auth/register with this token as the Bearer token and your details in the body."
}
```

**Already registered:** you get a 30-day login token and the profile.

```json
{ "success": true, "isNewUser": false, "token": "eyJhbGciOi…", "expiresInSeconds": 2592000, "volunteer": { … } }
```

### `POST /auth/register`

Header: `Authorization: Bearer <registrationToken>`

```json
{
  "name": "Rahul Kumar Sharma",
  "aadhaarNumber": "2345 6789 0124",
  "dateOfBirth": "2000-04-15",
  "city": "New Delhi",
  "gender": "male",
  "area": "Saket",
  "email": "rahul@example.com",
  "skills": ["crowd management", "ticketing"],
  "languages": ["Hindi", "English"],
  "emergencyContact": { "name": "Sunita Sharma", "phone": "9811111111", "relation": "mother" }
}
```

| Field | Required | Rules |
|---|---|---|
| `name` | yes | 2–80 chars |
| `aadhaarNumber` | yes | 12 digits, spaces/dashes allowed, must pass the Aadhaar (Verhoeff) checksum, one account per Aadhaar |
| `dateOfBirth` | yes | `YYYY-MM-DD`, must be 18+ |
| `city` | yes | Any spelling. It is normalised (see [Cities](#cities)). |
| `gender` | no | `male`, `female`, `other`, `prefer_not_to_say` |
| `area`, `email`, `skills`, `languages`, `emergencyContact` | no | `skills`/`languages` can be an array or a comma-separated string |

Unknown fields are rejected (`unknown_field`), which catches typos like `aadhar`.

Response `201`:

```json
{
  "success": true,
  "token": "eyJhbGciOi…",
  "expiresInSeconds": 2592000,
  "volunteer": {
    "id": "vol_pAvQOXBRfVYn",
    "name": "Rahul Kumar Sharma",
    "phone": "+919876543210",
    "email": "rahul@example.com",
    "dateOfBirth": "2000-04-15",
    "gender": "male",
    "city": "Delhi",
    "cityKey": "delhi",
    "area": "Saket",
    "skills": ["crowd management", "ticketing"],
    "languages": ["Hindi", "English"],
    "emergencyContact": { "name": "Sunita Sharma", "phone": "+919811111111", "relation": "mother" },
    "aadhaar": "XXXX XXXX 0124",
    "kyc": { "status": "pending", "note": null, "reviewedAt": null },
    "status": "active",
    "createdAt": "2026-11-06T17:16:29.775Z",
    "updatedAt": "2026-11-06T17:16:29.775Z"
  }
}
```

**How the Aadhaar number is handled:** the full number is never stored or returned. The server keeps the last 4 digits (shown masked) and an HMAC of the number, keyed with `APP_SECRET`. The HMAC is only used to stop one Aadhaar being used on two accounts. New volunteers start with KYC `pending`. A coordinator checks the person's card, matches the last 4 digits, and marks them `verified`. Only verified volunteers can be approved for events.

## Volunteer profile

### `GET /volunteer/me`

This returns the profile plus `stats` and `standing`:

```json
"stats": {
  "points": 20, "tier": "Bronze", "nextTier": { "name": "Silver", "pointsNeeded": 30 },
  "completedEvents": 1, "noShows": 0, "averageRating": 5, "ratingsCount": 1, "reliability": 100
},
"standing": {
  "city": { "name": "Delhi", "rank": 1, "rankedVolunteers": 14 },
  "overall": { "rank": 6, "rankedVolunteers": 220 }
}
```

`rank` is `null` until the volunteer has a reviewed event, and `standing.note` says so.

### `PATCH /volunteer/me`

Send only the fields you want to change. The fields are the same as at registration. `phone` can't be changed because it is the login.

- **Changing `city` changes which events the volunteer sees.** Events they already applied to stay visible.
- `name`, `dateOfBirth` and `aadhaarNumber` are locked once KYC is `verified` (`409 kyc_locked`). If KYC was `rejected`, changing any of them puts it back to `pending` for review.

## Events in the volunteer's city

### `GET /volunteer/events`

This returns upcoming (today or later, India time), `open` events whose city matches the volunteer's city, soonest first.

```json
{
  "success": true,
  "city": "Delhi",
  "total": 1,
  "events": [
    {
      "id": "evt_niT4sm9i4_M1",
      "title": "Diwali Mela 2026",
      "description": "Evening fair with 40 stalls and a live stage.",
      "city": "Delhi",
      "cityKey": "delhi",
      "venue": "JLN Stadium",
      "address": "Gate 14, Lodhi Road",
      "date": "2026-11-14",
      "startTime": "16:00",
      "endTime": "23:00",
      "roles": ["Entry gate", "Ticketing", "Backstage"],
      "volunteersNeeded": 12,
      "slotsLeft": 12,
      "status": "open",
      "myApplication": null
    }
  ]
}
```

`myApplication` is `{ "id", "status" }` once the volunteer has applied.

### `GET /volunteer/events/:eventId`

This returns the same shape for one event. It is allowed if the event is in the volunteer's city or they have applied to it. Otherwise it returns `403 city_mismatch`.

### `POST /volunteer/events/:eventId/apply`

```json
{ "preferredRole": "Ticketing", "note": "Available from 3pm" }
```

The body is optional. If the event lists `roles`, `preferredRole` must be one of them.

The request is refused when:

| Code | Status | Reason |
|---|---|---|
| `city_mismatch` | 403 | Event is in another city |
| `event_not_open` | 409 | Event is closed, completed or cancelled |
| `event_past` | 409 | Event date has passed |
| `event_full` | 409 | Approved volunteers already fill `volunteersNeeded` |
| `already_applied` | 409 | Volunteer already has an application (`details.status` says which) |
| `kyc_rejected` | 403 | Volunteer's Aadhaar verification was rejected |

Response `201`: `{ "application": { "id": "app_…", "status": "applied", "event": { … }, … } }`

### `POST /volunteer/events/:eventId/withdraw`

This works while the application is `applied` or `approved` and the event hasn't passed. A volunteer can apply again later, and the same application is reused.

### `GET /volunteer/applications`

This returns the volunteer's history, newest event first, with each review (`outcome`, `rating`, `comment`). Filter with `?status=applied|approved|rejected|withdrawn|completed|no_show`.

## Admin / coordination team

### `POST /admin/login`

```json
{ "apiKey": "<ADMIN_API_KEY>", "name": "Priya (Ops)" }
```

This returns a 12-hour admin token. `name` is recorded on everything this admin does (`createdBy`, `decidedBy`, `reviewedBy`, KYC `reviewedBy`). The endpoint allows 10 attempts per IP per 15 minutes.

### `POST /admin/events`

```json
{
  "title": "Diwali Mela 2026",
  "city": "Delhi",
  "venue": "JLN Stadium",
  "date": "2026-11-14",
  "volunteersNeeded": 12,
  "description": "Evening fair with 40 stalls and a live stage.",
  "address": "Gate 14, Lodhi Road",
  "startTime": "16:00",
  "endTime": "23:00",
  "roles": ["Entry gate", "Ticketing", "Backstage"],
  "status": "open",
  "image": "https://res.cloudinary.com/<your-cloud>/image/upload/diwali-mela.jpg",
  "imageCredit": "Photo: Newbi"
}
```

`title`, `city`, `venue`, `date` (today or later) and `volunteersNeeded` (1–5000) are required. Times use 24-hour `HH:MM`. `status` defaults to `open`.

Optional photo fields, shown on the volunteer's event card:

- `image`: an `https://` URL (e.g. a Cloudinary upload) or a path on this site, such as `/volunteer/img/events/diwali.jpg`. Anything else (`http:`, `javascript:` …) is rejected.
- `imageCredit`: short credit text, up to 160 characters, e.g. `"Photo: Jane Doe, CC BY 4.0"`.
- `imageCreditUrl`: where the credit links to (`https://` only).

Events also return these three fields. Application summaries include `event.image` for thumbnails.

The response includes `counts`: `{ applied, approved, rejected, withdrawn, completed, noShow, filled }`.

### `PATCH /admin/events/:eventId`

You can send any of the create fields. Common uses:

- `{ "status": "closed" }` stops new applications. The other statuses are `open`, `completed` and `cancelled`.
- `{ "volunteersNeeded": 20 }` adds slots. It can't go below the number already confirmed (`409 below_filled`).
- The city can't change once anyone has applied (`409 city_locked`).

### `GET /admin/events/:eventId/applications`

This returns the event plus every applicant. Pending applicants come first and, within each status, higher points come first. Each row carries a volunteer summary:

```json
{
  "id": "app_OcFIJuOumk3b",
  "status": "applied",
  "preferredRole": "Ticketing",
  "note": "Available from 3pm",
  "volunteer": {
    "id": "vol_pAvQOXBRfVYn", "name": "Rahul Kumar Sharma", "phone": "+919876543210", "city": "Delhi",
    "kycStatus": "verified", "status": "active",
    "points": 120, "tier": "Silver", "completedEvents": 9, "noShows": 0, "averageRating": 4.6
  }
}
```

### `POST /admin/applications/:applicationId/decision`

```json
{ "decision": "approve", "note": "Report at Gate 14 by 3:30pm" }
```

`decision` is `approve` or `reject`. The volunteer sees `note` as `decisionNote`. Approval needs the volunteer's KYC to be `verified` (`409 kyc_not_verified`) and a free slot (`409 event_full`). A decision can be changed between approved and rejected later.

### `POST /admin/applications/:applicationId/review`

This is allowed from the event date onwards, for approved volunteers.

```json
{ "outcome": "completed", "rating": 5, "comment": "Handled the entry rush brilliantly." }
```

or

```json
{ "outcome": "no_show" }
```

`rating` (1–5) is required for `completed`. Reviewing again overwrites the earlier review, and the ranking recalculates. The response includes the volunteer's updated `volunteerStats`.

### `GET /admin/volunteers`

Filters:

- `city`
- `kycStatus` (`pending|verified|rejected`)
- `status` (`active|suspended`)
- `q`: name, phone, or the last 4 Aadhaar digits

`sort=newest` (default) or `sort=points`. Each volunteer includes `stats`. Use `?kycStatus=pending` as the KYC review queue.

### `GET /admin/volunteers/:volunteerId`

This returns the full profile, stats, city/overall rank and every application with its event.

### `PATCH /admin/volunteers/:volunteerId`

```json
{ "kycStatus": "verified", "kycNote": "Matched last 4 digits on physical card" }
```

```json
{ "status": "suspended" }
```

Suspended volunteers can't sign in or use any volunteer endpoint, and they drop off the leaderboard.

## Ranking

`GET /ranking/rules` returns the live numbers. The defaults are in `backend/volunteers/ranking.js` (`RANKING`):

| What happened | Points |
|---|---|
| Completed an event | +10 |
| Rated 5★ / 4★ / 3★ / 2★ / 1★ | +10 / +5 / 0 / −5 / −10 on top |
| No-show | −15 |

Points never go below 0.

| Tier | Points |
|---|---|
| Bronze | 0+ |
| Silver | 50+ |
| Gold | 150+ |
| Platinum | 300+ |

Volunteers are ordered by points, then average rating, then events completed. Volunteers level on all three share a rank. A volunteer appears on the leaderboard after their first reviewed event. Stats come straight from the reviews and are never stored separately, so correcting a review updates everything.

Each volunteer's stats also include `reliability`: the percentage of reviewed events they turned up for.

### `GET /leaderboard`

- **Volunteer token:** defaults to the volunteer's own city. Names are shortened ("Rahul S."), and `you` holds the volunteer's own row even if it's outside the top `limit`.
- **Admin token:** defaults to all cities, with full names and `volunteerId`.
- `?city=Mumbai` picks a city. `?city=all` shows everyone.

```json
{
  "success": true,
  "scope": "Delhi",
  "rankedVolunteers": 2,
  "leaderboard": [
    { "rank": 1, "name": "Rahul S.", "isYou": false, "city": "Delhi", "tier": "Bronze", "points": 20, "completedEvents": 1, "averageRating": 5, "reliability": 100 },
    { "rank": 2, "name": "Asha P.", "isYou": true, "city": "Delhi", "tier": "Bronze", "points": 10, "completedEvents": 1, "averageRating": 3, "reliability": 100 }
  ],
  "you": { "rank": 2, "name": "Asha P.", "isYou": true, … }
}
```

## Cities

City is what links volunteers to events. Each city name is reduced to a `cityKey` in these steps:

1. Lower-case it.
2. Strip punctuation.
3. Collapse spaces.
4. Map old or alternate names to the current one:
   - New Delhi / Delhi NCR → Delhi
   - Bangalore → Bengaluru
   - Bombay → Mumbai
   - Gurgaon → Gurugram
   - Calcutta → Kolkata
   - Madras → Chennai
   - Poona → Pune
   - and a few more

So a volunteer who typed "new delhi" sees events created for "Delhi". The aliases live in `CITY_ALIASES` in `backend/volunteers/validate.js`. Noida, Gurugram, Ghaziabad and the other NCR cities stay separate cities.

`GET /cities` lists every city that has events or volunteers, with its count of upcoming open events. It can feed a city picker.

## Errors

```json
{ "success": false, "error": { "code": "city_mismatch", "message": "This event is in Mumbai. …", "details": { "eventCity": "Mumbai", "yourCity": "Delhi" } } }
```

| Status | Meaning |
|---|---|
| 400 | Invalid input (`missing_field`, `invalid_field`, `invalid_phone`, `invalid_aadhaar`, `too_young`, `wrong_otp` with `details.attemptsLeft`, `otp_expired`, `invalid_json`, `unknown_field`, …) |
| 401 | Missing, invalid or expired token, or wrong admin key |
| 403 | Wrong kind of token, `city_mismatch`, `account_suspended`, `kyc_rejected` |
| 404 | No such event/volunteer/application or endpoint |
| 409 | Valid request that the current state doesn't allow (`already_registered`, `aadhaar_in_use`, `event_full`, `kyc_not_verified`, `kyc_locked`, …) |
| 429 | OTP or login rate limit. `details.retryAfterSeconds` and a `Retry-After` header are included when known |
| 503 | Server not configured (`not_configured`, `sms_not_configured`) |

## Setup

### Prototype mode (the default)

The API runs with no configuration, locally and on Vercel. These prototype values are hardcoded in `PROTOTYPE` in `backend/volunteers/config.js`:

| Setting | Prototype value |
|---|---|
| `APP_SECRET` | A fixed random 64-character secret |
| `ADMIN_API_KEY` | `newbi-admin-2026` |
| OTP delivery | Dev mode: the OTP is returned in the API response and shown on the portal, until Twilio is configured |
| Demo mode | Demo events in seven cities, five demo volunteers in Delhi with rated history, and a demo account (see below). It is defined in `backend/volunteers/demo-data.js`. |

**Demo account:** phone `99999 99999`, OTP `123456`. The code is fixed, no SMS is sent, and nothing is stored to check it, so it signs in on any server copy. It signs in as Riya Kapoor (`vol_demo_riya`), Delhi, KYC verified, 55 points, Silver, #2 of 5 in Delhi. `GET /health` returns these details as `demoLogin`.

All demo documents have fixed ids (`evt_demo_*`, `vol_demo_*`, `app_demo_*`) and dates relative to today. Each server instance rewrites them once a day, before its first request. Copies of the function that don't share storage therefore all hold the same demo data.

On storage that isn't kept (Vercel without Redis), demo volunteers are **view-only**. `PATCH /volunteer/me`, `apply` and `withdraw` return `403 demo_read_only`, and `GET /volunteer/me` includes `"demoReadOnly": true`. On SQLite or Redis the demo account works fully.

The prototype has three limits:

- **No real security.** The repository is public, so anyone can read the admin key and the token secret. With the dev OTP, anyone can also sign in as any phone number. Don't collect real volunteers' details in this mode.
- **No shared storage on Vercel.** Vercel runs several copies of the function at once, and without Redis each keeps its own data in its own `/tmp`. Measured on the live site: right after registering, about 1 in 3 dashboard requests reached a copy that had never seen the account and got `401 account_not_found`. A code sent by one copy can also be "expired" on another. `/tmp` is wiped on restarts and deploys as well. A file database can't fix this, SQLite included; only a shared store such as Redis can.

### Storage

| Where | Store |
|---|---|
| `KV_REST_API_URL`/`KV_REST_API_TOKEN` set | Upstash Redis, shared by every copy. Use this for the hosted site. |
| Local runs (`npm start`) | **SQLite** at `data/newbi.sqlite`, via `better-sqlite3` (installed by `npm install`). It has `volunteers`, `events` and `applications` tables, with readable generated columns (`name`, `city`, `status`, …) and the full record in `doc`, plus `kv` (lookups) and `temp` (OTPs, rate limits). |
| Vercel without Redis, or SQLite not installed | A JSON file (`/tmp/volunteer-db.json` on Vercel, `data/volunteer-db.json` locally) |

### Moving off the prototype

Environment variables override the hardcoded values, so no code change is needed:

| Variable | Purpose |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis for lasting storage. Vercel → Storage → **Upstash for Redis** sets these. `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` also work. |
| `APP_SECRET` | Your own 32+ random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never change it once live: that logs everyone out and breaks duplicate-Aadhaar detection. |
| `ADMIN_API_KEY` | Your own admin password for `/admin/login`. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Real OTP texts. Setting these turns dev mode off. Indian SMS needs a DLT-registered sender and template. |
| `OTP_DEV_MODE` | `true` or `false` forces dev mode on or off regardless of Twilio. |
| `DEMO_MODE` | `false` removes the demo account and stops writing demo data. |
| `CORS_ORIGIN` | Allowed browser origin. The default is `*`. |
| `SQLITE_FILE` | SQLite database file. The default is `data/newbi.sqlite` locally; it is off on Vercel unless set. |
| `VOLUNTEER_DB_FILE` | JSON fallback file. The default is `data/volunteer-db.json` locally and `/tmp/volunteer-db.json` on Vercel. |

After changing variables in Vercel, redeploy. Then open `https://newbi-clone.vercel.app/api/v1/health`. `prototype` turns `false` once your own secrets are set, and `warnings` lists anything still missing.

### Tests

```
npm test
```

The tests run the whole flow against an in-memory store: OTP, registration rules, city filtering, KYC gating, reviews, ranking, routing and the Vercel adapter.

## Not built yet

- **Aadhaar eKYC.** The checksum only proves a number is well-formed. Checking that it belongs to the person needs a UIDAI-licensed eKYC provider (e.g. Aadhaar OTP through Digio, Signzy or Surepass). Until then, the coordinator checks the card by hand. `/auth/register` is where an eKYC call would go.
- **Document upload.** There is no Aadhaar or photo upload yet. That needs file storage such as Vercel Blob or Cloudinary.
- **Scale.** Lists and the leaderboard are computed from the full data set on each request. That is fine for thousands of volunteers. Past that, move to a database with indexes (e.g. Postgres) and cache leaderboards.
