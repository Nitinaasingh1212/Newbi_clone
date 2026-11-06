// Storage for the volunteer API. Documents live in hashes (name -> id -> JSON string);
// OTP codes and rate-limit counters are short-lived keys with a TTL.
//
// - Upstash Redis over its REST API when KV_REST_API_URL/KV_REST_API_TOKEN (or the
//   UPSTASH_REDIS_REST_* pair) are set. Use this on Vercel: it is the only option here that
//   keeps data between function invocations.
// - Otherwise a JSON file (data/volunteer-db.json locally). On Vercel that file sits in /tmp,
//   which belongs to one function instance and is wiped on cold starts.
// - createMemoryStore() keeps everything in memory, for tests.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createStore(config) {
  if (config.redis) return redisStore(config.redis);
  return fileStore(config.dbFile, { persistent: !config.onVercel });
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
