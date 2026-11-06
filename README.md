# newbi.live clone

A mirror of the newbi.live landing site, plus a **volunteer portal**. Event volunteers sign up with their phone and Aadhaar, see events in their city, apply, and climb a city leaderboard as the coordination team rates them.

## Links

| What | URL |
|---|---|
| Landing page (with the "Volunteer with us" bar) | https://newbi-clone.vercel.app |
| **Volunteer registration / portal** | **https://newbi-clone.vercel.app/volunteer** |
| Volunteer API (lists every endpoint) | https://newbi-clone.vercel.app/api/v1 |
| API setup check | https://newbi-clone.vercel.app/api/v1/health |

The portal needs a few Vercel settings before people can sign up. See [Going live](#going-live). Until then it shows "Opening soon".

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
- **Admin key:** `dev-admin-key`.

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

## Going live

The volunteer API refuses to run in production until it has secrets and real storage. In Vercel → this project:

1. **Storage** → add **Upstash for Redis** and connect it. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Without it, data lives in `/tmp` and disappears.
2. **Settings → Environment Variables:**
   - `APP_SECRET`: 32+ random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never change it once live.
   - `ADMIN_API_KEY`: password for `POST /api/v1/admin/login`.
   - `OTP_DEV_MODE=true`: only while testing without SMS. It shows the OTP on screen, so **turn it off before real use**.
   - For real SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. Indian SMS needs a DLT-registered sender.
3. **Redeploy.** Environment variables only apply to new deployments.
4. Open https://newbi-clone.vercel.app/api/v1/health. It should say `"status":"ok"`, and `warnings` lists anything missing.

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
