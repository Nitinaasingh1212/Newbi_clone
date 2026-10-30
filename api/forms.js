// Vercel function for /api/forms: the deployed counterpart of handleApi in server.mjs.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default async function handler(req, res) {
  const type = String(req.query.type || '').replace(/[^\w-]/g, '');

  if (req.method === 'POST') {
    // Form submissions are logged, never forwarded to the real site.
    console.log(`[form:${type}]`, JSON.stringify(req.body));
    return res.status(200).json({ success: true });
  }

  try {
    const body = await readFile(join(process.cwd(), 'site', 'api', `forms.${type}.json`), 'utf8');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(body);
  } catch {
    return res.status(200).json({ success: true, items: [] });
  }
}
