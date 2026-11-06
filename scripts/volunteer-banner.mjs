// Adds the "Volunteer with Newbi" bar and floating button (scripts/volunteer-banner.html) to
// the mirrored landing page, linking to the volunteer portal at /volunteer.
//
// The snippet goes right after <body>, outside #landing-root, so React hydration never sees
// it. Running this again replaces the previous copy. mirror.mjs runs it after every
// re-download; to apply it by hand: node scripts/volunteer-banner.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const START = '<!-- volunteer-banner:start (scripts/volunteer-banner.mjs) -->';
const END = '<!-- volunteer-banner:end -->';

export function withVolunteerBanner(html, snippet) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  const clean = start !== -1 && end > start ? html.slice(0, start) + html.slice(end + END.length + 1) : html;
  if (!clean.includes('<body>')) throw new Error('The landing page has no <body> tag to add the volunteer banner after.');
  return clean.replace('<body>', `<body>\n${START}\n${snippet.trim()}\n${END}`);
}

export async function applyVolunteerBanner(page = join(ROOT, 'site', 'index.html')) {
  const snippet = await readFile(join(ROOT, 'scripts', 'volunteer-banner.html'), 'utf8');
  const html = await readFile(page, 'utf8');
  await writeFile(page, withVolunteerBanner(html, snippet));
  console.log(`Volunteer banner added to ${page}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  applyVolunteerBanner().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
