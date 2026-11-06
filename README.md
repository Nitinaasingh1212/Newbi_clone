# newbi.live clone

A local mirror of the newbi.live landing site (`/`, `/work`, `/creator`, `/contact`, `/terms`, `/privacy`, `/concertzone`), including its JS bundles, CSS, fonts and brand images.

## Run

```
npm start          # http://localhost:3000  (set PORT to change)
```

## Volunteer API

`/api/v1` is a backend for event volunteers:

- Phone OTP sign-in and Aadhaar-backed registration.
- Events shown by the volunteer's city.
- Applications and coordinator ratings.
- A points/tier ranking with city leaderboards.

The code is in `backend/volunteers/`. See [docs/volunteer-api.md](docs/volunteer-api.md) for every endpoint and for the Vercel setup (Upstash Redis, `APP_SECRET`, `ADMIN_API_KEY`).

```
npm test           # end-to-end tests for the volunteer API
```

## Deploy to Vercel

Import the repo in Vercel (no build step needed). `vercel.json` serves `site/` as the output directory, routes `/api/forms` to the function in `api/forms.js`, rewrites `/api/v1/*` to the volunteer API function in `api/v1.js`, and falls back to the app shell for unknown routes.

## Re-download from the live site

```
npm run mirror     # refreshes ./site
```

## How it works

- `site/` holds the pages and assets exactly as the live site serves them.
- `server.mjs` serves `site/` with clean URLs (`/creator` → `creator/index.html`). Routes with no page of their own fall back to the app shell.
- `/api/forms?type=public-feed` and `?type=public-archive` are answered from `site/api/forms.<type>.json`.
- Form submissions (`POST /api/forms?type=enquiry`) are logged to the console and are never sent to the real site.
- Case-study photos are still loaded from their original hosts (Cloudinary etc.).
- "Sign in", "Join free" and the Community links point to `app.newbi.live`, which is a separate app and isn't mirrored.
