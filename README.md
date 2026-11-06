# newbi.live clone

A mirror of the newbi.live landing site, plus a **volunteer portal**. Event volunteers sign up with their phone and Aadhaar, see events in their city, apply, and climb a city leaderboard as the coordination team rates them.

## Links

| What | URL |
|---|---|
| Landing page (with the "Volunteer with us" bar) | https://newbi-clone.vercel.app |
| **Volunteer registration / portal** | **https://newbi-clone.vercel.app/volunteer** |
| Volunteer API (lists every endpoint) | https://newbi-clone.vercel.app/api/v1 |
| API setup check | https://newbi-clone.vercel.app/api/v1/health |

This is a **prototype**. It works with no setup, using values hardcoded in the backend. See [Prototype mode](#prototype-mode) for what that means and how to move off it.

## What's in this repo

| Path | What it is |
|---|---|
| `site/` | The newbi.live landing pages and assets, mirrored as served (`/`, `/work`, `/creator`, `/contact`, `/terms`, `/privacy`, `/concertzone`) |
| `site/volunteer/` | The volunteer portal: one self-contained page, served at `/volunteer` |
| `backend/volunteers/` | The volunteer API behind `/api/v1`. It has no dependencies. |
| `api/` | Vercel functions: `forms.js` (mirrored site forms) and `v1.js` (volunteer API) |
| `server.mjs` | Local server for all of the above |
| `scripts/` | `mirror.mjs` re-downloads the site. `volunteer-banner.*` adds the volunteer bar to the landing page. |
| `docs/volunteer-api.md` | Full API reference: every endpoint, request/response examples, ranking rules, setup |
| `test/` | End-to-end API tests |
| `newbi-clone/` | A separate React + Express + MongoDB rebuild of the platform. See [its README](newbi-clone/README.md). |

## Run locally

```
npm start          # http://localhost:3000  (set PORT to change)
npm test           # volunteer API tests
```

Open http://localhost:3000/volunteer to try the portal. Locally nothing needs configuring:

- **OTPs:** shown on screen instead of sent by SMS.
- **Data:** goes to `data/volunteer-db.json`.
- **Admin key:** `newbi-admin-2026`.
- **Demo events:** a few per major city, so the dashboard has something to show.

## Volunteer portal

At `/volunteer`, a volunteer can:

1. **Verify their phone.** They enter their mobile number and type in the 6-digit OTP. A returning volunteer goes straight to their dashboard.
2. **Register** (new volunteers):
   - name, date of birth (18+), Aadhaar number, city
   - optional: area, skills, languages, email, emergency contact
   - a consent tick

   The Aadhaar checksum is checked as they type. Only the last 4 digits are ever stored.
3. **Use their dashboard:**
   - **Events in their city.** They can apply with a preferred role, or withdraw.
   - **Their applications,** with the coordinator's decision notes and star ratings.
   - **Their city leaderboard.**
   - **Their stats:** points, tier, city rank, events completed and average rating.
   - **Change city.** This changes which events they see.
   - **Fix rejected details.** If the Aadhaar check is rejected, they can correct their name, date of birth or Aadhaar number and resubmit.

The page follows the site's light/dark setting (`nb_theme`) and works on mobile.

There is no admin screen yet. Coordinators manage events, verify Aadhaar, approve applicants and rate volunteers through the admin endpoints in [docs/volunteer-api.md](docs/volunteer-api.md#admin--coordination-team).

### The link on the landing page

The landing page has a "Now recruiting volunteers… Register →" bar at the top. A "Volunteer with us" button also appears bottom-right once you scroll. Both link to `/volunteer`.

They sit outside the React app (`#landing-root`), so hydration never touches them.

- **To change the text or style,** edit `scripts/volunteer-banner.html` and run `node scripts/volunteer-banner.mjs`. It replaces the copy already in `site/index.html`.
- **On a re-mirror,** `npm run mirror` puts the banner back automatically after downloading a fresh `index.html`.

## Prototype mode

To make the prototype work without any Vercel setup, these are hardcoded in `PROTOTYPE` in [`backend/volunteers/config.js`](backend/volunteers/config.js):

| Setting | Prototype value |
|---|---|
| `APP_SECRET` | A fixed random secret |
| `ADMIN_API_KEY` | `newbi-admin-2026`. Sign in with `POST /api/v1/admin/login` `{ "apiKey": "newbi-admin-2026", "name": "Your name" }`. |
| OTP | Shown on screen instead of sent by SMS |
| Demo events | Two each in Delhi, Mumbai and Bengaluru, and one each in Hyderabad, Pune, Kolkata and Chennai |

The prototype has three limits:

- **It isn't secure.** This repo is public, so anyone can read the admin key and token secret. With on-screen OTPs, anyone can sign in as any number. **Don't collect real volunteers' details yet.**
- **Data doesn't last on Vercel.** Without a database, accounts and applications are wiped whenever the server restarts: after a quiet period, and on every deploy. The demo events come back with fresh dates.
- **Redis can't be hardcoded.** Lasting storage needs an actual database, and creating one needs your Vercel login.

### Moving off the prototype

Set these in Vercel → this project, then **redeploy**. They override the hardcoded values, so no code change is needed:

1. **Storage** → add **Upstash for Redis** and connect it. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`, and data stops disappearing.
2. **Settings → Environment Variables:**
   - `APP_SECRET`: your own 32+ random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `ADMIN_API_KEY`: your own admin password.
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: real SMS. This also turns on-screen OTPs off. Indian SMS needs a DLT-registered sender.
   - `SEED_DEMO_EVENTS=false`: stops adding demo events.
3. Open https://newbi-clone.vercel.app/api/v1/health. `prototype` becomes `false`, and `warnings` lists anything still missing.

All variables are listed in [`.env.example`](.env.example).

## Deploy to Vercel

Pushing to `main` deploys automatically. There is no build step. `vercel.json`:

- serves `site/` as the output directory (so `/volunteer` is `site/volunteer/index.html`)
- sends `/api/forms` to `api/forms.js`
- rewrites `/api/v1/*` to the volunteer API in `api/v1.js`
- falls back to the app shell for unknown routes

## Re-download from the live site

```
npm run mirror     # refreshes ./site, then re-adds the volunteer banner
```

## How the mirror works

- `site/` holds the pages and assets exactly as the live site serves them. The exceptions are the volunteer banner in `site/index.html` and the new `site/volunteer/` folder.
- `server.mjs` serves `site/` with clean URLs (`/creator` → `creator/index.html`). Routes with no page of their own fall back to the app shell.
- `/api/forms?type=public-feed` and `?type=public-archive` are answered from `site/api/forms.<type>.json`.
- Form submissions (`POST /api/forms?type=enquiry`) are logged to the console and are never sent to the real site.
- Case-study photos are still loaded from their original hosts (Cloudinary etc.).
- "Sign in", "Join free" and the Community links point to `app.newbi.live`, which is a separate app and isn't mirrored.
