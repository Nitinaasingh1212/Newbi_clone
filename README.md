# OSH Entertainment: Pan India Event Network

**One Nation. One Crew. Unlimited Events.** The site for OSH Entertainment's event crew network. Volunteers register with their phone (OTP) and Aadhaar, see crew opportunities at events in their city, and tell the team "I'm Interested". The OSH team picks the crew, rates everyone after the event, and those ratings build a ranking: New Joiner → Trained → Experienced → 5-Star Elite. Vendors can register too, and volunteers can send feedback straight to management.

OSH is not a ticketing platform: there is no ticket booking anywhere on the site.

## Links

| What | URL |
|---|---|
| Home | https://newbi-clone.vercel.app |
| Upcoming events (crew opportunities) | https://newbi-clone.vercel.app/events |
| **Volunteer registration** | **https://newbi-clone.vercel.app/volunteer** |
| Volunteer sign-in (with the demo account) | https://newbi-clone.vercel.app/volunteer/login |
| Vendor registration | https://newbi-clone.vercel.app/vendors |
| Volunteer feedback | https://newbi-clone.vercel.app/feedback |
| OSH Admin Dashboard | https://newbi-clone.vercel.app/admin |
| API (lists every endpoint) | https://newbi-clone.vercel.app/api/v1 |
| API setup check | https://newbi-clone.vercel.app/api/v1/health |

This is a **prototype**. It works with no setup, using values hardcoded in the backend. See [Prototype mode](#prototype-mode) for what that means and how to move off it.

## Pages

| Page | What it does |
|---|---|
| `/` | India's Event Crew Network: the "Be Part of OSH!" banner (Volunteer Join / Vendor Join), network numbers, Star Volunteers (top-ranked, from the API), the city network grid, event categories, upcoming events and the network snapshot |
| `/events` | Every upcoming crew opportunity, filtered by city, category and search. Filters live in the URL (`/events?city=Lucknow`). |
| `/events/<id>` | Event details, volunteer roles, open positions, and the **I'm Interested** panel. Volunteers can send interest only for events in their own city; everyone else is guided to register or sign in. |
| `/volunteer` | Volunteer registration: name, mobile (OTP), email, preferred city, skill / department, experience, availability, date of birth and Aadhaar, next to the Elite Crew ladder. `?event=<id>` returns the new volunteer to that event. |
| `/volunteer/login` | Sign in with phone + OTP, including the demo account |
| `/profile` | The volunteer dashboard: next shift, points, tier, city rank, events in their city, their interest responses and ratings, the leaderboard, and editing city, skill, experience and availability |
| `/vendors` | Vendor registration (company, contact, mobile, city, category, optional GST, services). Vendors start as pending until OSH verifies them. |
| `/feedback` | Confidential volunteer feedback; the name is optional |
| `/admin` | OSH Admin Dashboard: counts, events with the volunteers interested in each (approve / reject, verify Aadhaar, rate after the event, add events), volunteer records, vendor verification and the feedback inbox |
| `/about`, `/terms`, `/privacy`, `/credits` | About OSH, the draft legal pages, and photo credits |

All pages share one design system, the emerald green OSH UI ([`site/osh/osh.css`](site/osh/osh.css)), and one shell script ([`site/osh/app.js`](site/osh/app.js)) for the header (OSH logo, search, notifications, light/dark mode, sign in), the phone menu and tab bar, the footer and the API client. Each page's own script is in [`site/osh/pages/`](site/osh/pages/).

## Demo data and the demo account

The demo events are the 12 crew opportunities from the OSH brief (DJ Night in Lucknow, Corporate Annual Awards in Delhi, College Fest 2026 in Mumbai, and so on) across Lucknow, Delhi, Mumbai, Gurugram, Punjab, Chennai, Jaipur, Bengaluru and Haryana. Dates are relative to today, so the demo never goes stale. Demo events say "Demo event: details and counts are illustrative" on the site.

To see a filled-in volunteer dashboard, open the [sign-in page](https://newbi-clone.vercel.app/volunteer/login) and click **Sign in as the demo volunteer**, or type:

| Phone | OTP |
|---|---|
| `99999 99999` | `123456` |

You're signed in as **Riya Kapoor**, a verified volunteer in Delhi: 55 points, **Trained** tier, #2 of 5 in Delhi, approved for the Corporate Annual Awards, with three rated past events.

The demo data is rewritten each day. On the hosted site the demo account is **view-only** (sending interest and editing the profile are switched off), because Vercel's copies of the API don't share storage. Locally (`npm start`) it can do everything. `DEMO_MODE=false` turns the demo off. It is all defined in [`backend/volunteers/demo-data.js`](backend/volunteers/demo-data.js).

The numbers in the home page's tiles (1,250+ volunteers, 28 cities, 85+ vendors, 120+ events) come from the OSH design and are written into `site/index.html` and `site/about/index.html`. Replace them with real figures before launch. The network snapshot and the admin counts are live.

## Run locally

```
npm install        # once: installs the SQLite driver (better-sqlite3)
npm start          # http://localhost:3000  (set PORT to change)
npm test           # API tests
```

Locally nothing needs configuring:

- **OTPs:** shown on screen instead of sent by SMS.
- **Data:** stored in **SQLite** at `data/newbi.sqlite`. It survives restarts, and you can open it in any SQLite viewer (DB Browser for SQLite, the `sqlite3` CLI).
- **Admin key:** `newbi-admin-2026` (sign in at http://localhost:3000/admin).

### What's in the SQLite database

| Table | Holds |
|---|---|
| `volunteers` | `name`, `phone`, `city`, `kyc_status`, `status`, `created_at`, plus `doc` (the full record) |
| `events` | `title`, `city`, `date`, `status`, `volunteers_needed`, `created_by`, plus `doc` |
| `applications` | Interest responses: `event_id`, `volunteer_id`, `status`, `preferred_role`, `rating`, `applied_at`, plus `doc` |
| `vendors` | `company_name`, `contact_person`, `phone`, `city`, `category`, `gstin`, `status`, `created_at`, plus `doc` |
| `feedback` | `category`, `name`, `status`, `created_at`, plus `doc` |
| `kv` | Lookups: phone → volunteer, Aadhaar hash → volunteer, (event, volunteer) → application, vendor phone → vendor |
| `temp` | OTP codes and rate-limit counters, each with an expiry time |

To start from scratch, stop the server and delete the `data/` folder.

## What's in this repo

| Path | What it is |
|---|---|
| `site/` | The OSH website, served as static files |
| `backend/volunteers/` | The API behind `/api/v1`. No dependencies apart from the optional SQLite driver. |
| `api/v1.js` | The Vercel function for the API |
| `server.mjs` | Local server for the site and the API |
| `docs/volunteer-api.md` | Full API reference: every endpoint, examples, ranking rules, setup |
| `test/` | End-to-end API tests |
| `mirror/newbi/`, `scripts/mirror.mjs` | An archived mirror of the earlier newbi.live landing site. It is not served. |
| `newbi-clone/` | A separate React + Express + MongoDB rebuild from earlier. See [its README](newbi-clone/README.md). |

## Prototype mode

To make the prototype work without any Vercel setup, these are hardcoded in `PROTOTYPE` in [`backend/volunteers/config.js`](backend/volunteers/config.js):

| Setting | Prototype value |
|---|---|
| `APP_SECRET` | A fixed random secret |
| `ADMIN_API_KEY` | `newbi-admin-2026`, for the [Admin Dashboard](https://newbi-clone.vercel.app/admin) |
| OTP | Shown on screen instead of sent by SMS |
| Demo mode | The demo events, five demo volunteers in Delhi and the [demo account](#demo-data-and-the-demo-account) |

The prototype has two limits:

- **It isn't secure.** This repo is public, so anyone can read the admin key and token secret. With on-screen OTPs, anyone can sign in as any number. **Don't collect real volunteers' or vendors' details yet.**
- **The hosted link needs a shared database.** Vercel runs several copies of the API at once, each with its own temporary disk, and a file database (SQLite included) can't be shared between them. On the hosted site, new sign-ups, vendor registrations, feedback and admin changes can land on a copy that later requests don't reach. Locally they all stick. On Vercel, add **Upstash for Redis** (step 1 below), which all copies share.

### Moving off the prototype

Set these in Vercel → this project, then **redeploy**. They override the hardcoded values, so no code change is needed:

1. **Storage** → add **Upstash for Redis** and connect it. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. **Settings → Environment Variables:**
   - `APP_SECRET`: your own 32+ random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `ADMIN_API_KEY`: your own admin password.
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: real SMS. This also turns on-screen OTPs off. Indian SMS needs a DLT-registered sender.
   - `DEMO_MODE=false`: removes the demo account and stops adding demo data.
3. Open https://newbi-clone.vercel.app/api/v1/health. `prototype` becomes `false`, and `warnings` lists anything still missing.

All variables are listed in [`.env.example`](.env.example).

## Deploy to Vercel

Pushing to `main` deploys automatically. There is no build step. `vercel.json` serves `site/` as the output directory, rewrites `/api/v1/*` to `api/v1.js`, and serves `/events/<id>` from `site/events/event.html`.
