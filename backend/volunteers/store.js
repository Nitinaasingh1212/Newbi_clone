// Storage for the volunteer API. Documents live in hashes (name -> id -> JSON string);
// OTP codes and rate-limit counters are short-lived keys with a TTL.
//
// - Upstash Redis over its REST API when KV_REST_API_URL/KV_REST_API_TOKEN (or the
//   UPSTASH_REDIS_REST_* pair) are set. Use this on Vercel: Vercel runs several copies of
//   the function at once, and Redis is the only option here that they all share.
// - Otherwise SQLite (data/newbi.sqlite) for local runs, through better-sqlite3.
// - Otherwise a JSON file: on Vercel without Redis (/tmp, one per function copy, wiped on
//   restart), or locally if better-sqlite3 isn't installed.
// - createMemoryStore() keeps everything in memory, for tests.
import { mkdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);

export function createStore(config) {
  if (config.redis) return redisStore(config.redis);
  if (config.sqliteFile) {
    try {
      return sqliteStore(config.sqliteFile);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' && !/better-sqlite3|bindings/i.test(err.message)) throw err;
      console.warn(`[volunteer-api] SQLite unavailable (${err.message.split('\n')[0]}); using ${config.dbFile}. Run npm install to enable it.`);
    }
  }
  return fileStore(config.dbFile, { persistent: !config.onVercel });
}

// Each collection gets its own table. The document is stored whole in `doc`; the other
// columns are generated from it so the data is readable in any SQLite browser.
const SQLITE_TABLES = {
  volunteers: { name: '$.name', phone: '$.phone', city: '$.city', kyc_status: '$.kyc.status', status: '$.status', created_at: '$.createdAt' },
  events: { title: '$.title', city: '$.city', date: '$.date', status: '$.status', volunteers_needed: '$.volunteersNeeded', created_by: '$.createdBy' },
  applications: { event_id: '$.eventId', volunteer_id: '$.volunteerId', status: '$.status', preferred_role: '$.preferredRole', rating: '$.review.rating', applied_at: '$.appliedAt' },
};

export function sqliteStore(file) {
  const Database = require('better-sqlite3');
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');

  for (const [table, columns] of Object.entries(SQLITE_TABLES)) {
    const generated = Object.entries(columns)
      .map(([column, path]) => `, ${column} GENERATED ALWAYS AS (json_extract(doc, '${path}')) VIRTUAL`)
      .join('');
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, doc TEXT NOT NULL${generated})`);
  }
  // kv: lookup indexes (phone -> volunteer, Aadhaar hash -> volunteer, ...) and flags.
  // temp: OTP codes and rate-limit counters, each with an expiry time in ms.
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (name TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (name, key));
    CREATE TABLE IF NOT EXISTS temp (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL);
  `);

  const docs = Object.fromEntries(
    Object.keys(SQLITE_TABLES).map((t) => [
      t,
      {
        get: db.prepare(`SELECT doc AS value FROM ${t} WHERE id = ?`),
        all: db.prepare(`SELECT id AS key, doc AS value FROM ${t}`),
        put: db.prepare(`INSERT INTO ${t} (id, doc) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc`),
        putNew: db.prepare(`INSERT OR IGNORE INTO ${t} (id, doc) VALUES (?, ?)`),
        del: db.prepare(`DELETE FROM ${t} WHERE id = ?`),
      },
    ]),
  );
  const kvGet = db.prepare('SELECT value FROM kv WHERE name = ? AND key = ?');
  const kvAll = db.prepare('SELECT key, value FROM kv WHERE name = ?');
  const kvPut = db.prepare('INSERT INTO kv (name, key, value) VALUES (?, ?, ?) ON CONFLICT(name, key) DO UPDATE SET value = excluded.value');
  const kvPutNew = db.prepare('INSERT OR IGNORE INTO kv (name, key, value) VALUES (?, ?, ?)');
  const kvDel = db.prepare('DELETE FROM kv WHERE name = ? AND key = ?');
  // Hash names come from the code, never from requests; unknown ones go to the kv table.
  const table = (hash) => (Object.hasOwn(docs, hash) ? docs[hash] : null);

  const tempGet = db.prepare('SELECT value FROM temp WHERE key = ? AND expires_at > ?');
  const tempSet = db.prepare('INSERT INTO temp (key, value, expires_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at');
  const tempDel = db.prepare('DELETE FROM temp WHERE key = ?');
  const tempPrune = db.prepare('DELETE FROM temp WHERE expires_at <= ?');
  // Starts a counter at 0, or restarts it if its window has expired; a live counter is left alone.
  const tempStart = db.prepare(
    'INSERT INTO temp (key, value, expires_at) VALUES (?, 0, ?) ON CONFLICT(key) DO UPDATE SET value = 0, expires_at = excluded.expires_at WHERE temp.expires_at <= ?',
  );
  const tempIncr = db.prepare('UPDATE temp SET value = CAST(value AS INTEGER) + 1 WHERE key = ? RETURNING value');
  const incr = db.transaction((name, ttlSeconds) => {
    const now = Date.now();
    tempStart.run(name, now + ttlSeconds * 1000, now);
    return Number(tempIncr.get(name).value);
  });

  return {
    describe: () => ({ kind: 'sqlite', path: file, persistent: file !== ':memory:' }),
    close: () => db.close(),
    async hget(hash, field) {
      const t = table(hash);
      return (t ? t.get.get(field) : kvGet.get(hash, field))?.value ?? null;
    },
    async hgetall(hash) {
      const t = table(hash);
      const rows = t ? t.all.all() : kvAll.all(hash);
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    },
    async hset(hash, field, value) {
      const t = table(hash);
      if (t) t.put.run(field, value);
      else kvPut.run(hash, field, value);
    },
    async hsetnx(hash, field, value) {
      const t = table(hash);
      return (t ? t.putNew.run(field, value) : kvPutNew.run(hash, field, value)).changes === 1;
    },
    async hdel(hash, field) {
      const t = table(hash);
      if (t) t.del.run(field);
      else kvDel.run(hash, field);
    },
    async setTemp(name, value, ttlSeconds) {
      const now = Date.now();
      tempPrune.run(now);
      tempSet.run(name, String(value), now + ttlSeconds * 1000);
    },
    async getTemp(name) {
      return tempGet.get(name, Date.now())?.value ?? null;
    },
    async delTemp(name) {
      tempDel.run(name);
    },
    async incrTemp(name, ttlSeconds) {
      return incr(name, ttlSeconds);
    },
  };
}

export function createMemoryStore() {
  return fileStore(null, { persistent: false });
}

function redisStore({ url, token }) {
  const prefix = 'newbi:vol:';
  const key = (name) => prefix + name;

  async function pipeline(commands) {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands.map((command) => command.map(String))),
    });
    if (!res.ok) throw new Error(`Redis REST request failed with HTTP ${res.status}: ${await res.text()}`);
    const results = await res.json();
    const failed = results.find((r) => r.error);
    if (failed) throw new Error(`Redis error: ${failed.error}`);
    return results.map((r) => r.result);
  }
  const run = async (...command) => (await pipeline([command]))[0];

  return {
    describe: () => ({ kind: 'redis', persistent: true }),
    hget: (hash, field) => run('HGET', key(hash), field),
    async hgetall(hash) {
      const flat = (await run('HGETALL', key(hash))) || [];
      const out = {};
      for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1];
      return out;
    },
    hset: (hash, field, value) => run('HSET', key(hash), field, value),
    hsetnx: async (hash, field, value) => (await run('HSETNX', key(hash), field, value)) === 1,
    hdel: (hash, field) => run('HDEL', key(hash), field),
    setTemp: (name, value, ttlSeconds) => run('SET', key(name), value, 'EX', ttlSeconds),
    getTemp: (name) => run('GET', key(name)),
    delTemp: (name) => run('DEL', key(name)),
    async incrTemp(name, ttlSeconds) {
      // SET NX starts the window once; INCR keeps the TTL that SET gave the key.
      const [, count] = await pipeline([
        ['SET', key(name), 0, 'EX', ttlSeconds, 'NX'],
        ['INCR', key(name)],
      ]);
      return count;
    },
  };
}

function fileStore(file, { persistent }) {
  let data = { hashes: {}, temp: {} };
  if (file) {
    try {
      data = JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  // Writes are chained so two requests never write the file at the same time.
  let writing = Promise.resolve();
  function save() {
    if (!file) return Promise.resolve();
    const now = Date.now();
    for (const [name, entry] of Object.entries(data.temp)) if (entry.expiresAt <= now) delete data.temp[name];
    const snapshot = JSON.stringify(data);
    const next = writing.then(async () => {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, snapshot);
    });
    writing = next.catch(() => {});
    return next;
  }

  const hash = (name) => (data.hashes[name] ??= {});
  function liveTemp(name) {
    const entry = Object.hasOwn(data.temp, name) ? data.temp[name] : null;
    if (entry && entry.expiresAt <= Date.now()) {
      delete data.temp[name];
      return null;
    }
    return entry;
  }

  return {
    describe: () => (file ? { kind: 'file', path: file, persistent } : { kind: 'memory', persistent: false }),
    async hget(name, field) {
      const h = hash(name);
      return Object.hasOwn(h, field) ? h[field] : null;
    },
    async hgetall(name) {
      return { ...hash(name) };
    },
    async hset(name, field, value) {
      hash(name)[field] = value;
      await save();
    },
    async hsetnx(name, field, value) {
      if (Object.hasOwn(hash(name), field)) return false;
      hash(name)[field] = value;
      await save();
      return true;
    },
    async hdel(name, field) {
      delete hash(name)[field];
      await save();
    },
    async setTemp(name, value, ttlSeconds) {
      data.temp[name] = { value: String(value), expiresAt: Date.now() + ttlSeconds * 1000 };
      await save();
    },
    async getTemp(name) {
      return liveTemp(name)?.value ?? null;
    },
    async delTemp(name) {
      delete data.temp[name];
      await save();
    },
    async incrTemp(name, ttlSeconds) {
      const entry = liveTemp(name) ?? (data.temp[name] = { value: '0', expiresAt: Date.now() + ttlSeconds * 1000 });
      entry.value = String(Number(entry.value) + 1);
      await save();
      return Number(entry.value);
    },
  };
}
