// Integration tests for the admin API against an in-memory fake of the Upstash REST API.
// Run: npm run test:admin
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent } from '../shared/validate';
import { GET as publicGet } from '../api/content';
import { POST as loginPost } from '../api/admin/login';
import { DELETE as adminDelete, GET as adminGet, PUT as adminPut } from '../api/admin/content';
import { POST as restorePost } from '../api/admin/restore';

const read = (p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const base = { events: read('src/data/events.json'), contacts: read('src/data/contacts.json'), meta: read('src/data/meta.json') };
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// ---- fake Upstash ----
const db = new Map<string, string>();
const run = (a: (string | number)[]): unknown => {
  const [c, k, v, opt] = a as string[];
  switch (c) {
    case 'GET': return db.get(k) ?? null;
    case 'SET': if (opt === 'NX' && db.has(k)) return null; db.set(k, v); return 'OK';
    case 'INCR': { const n = (Number(db.get(k)) || 0) + 1; db.set(k, String(n)); return n; }
    case 'EXPIRE': return 1;
    case 'DEL': return db.delete(k) ? 1 : 0;
    default: throw new Error(`fake redis: unsupported ${c}`);
  }
};
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string, init: RequestInit) => {
  if (!String(url).startsWith('https://fake.upstash.io')) return realFetch(url, init);
  await new Promise((r) => setTimeout(r, Math.random() * 3)); // force interleaving
  const body = JSON.parse(init.body as string);
  const out = String(url).endsWith('/pipeline') ? body.map((c: (string | number)[]) => ({ result: run(c) })) : { result: run(body) };
  return new Response(JSON.stringify(out), { status: 200 });
}) as typeof fetch;

const req = (method: string, body?: unknown, token?: string, ip = '1.1.1.1') =>
  new Request('https://x.test/api', { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
const j = async (r: Response) => ({ status: r.status, body: await r.json() as any });

let n = 0;
const test = async (name: string, f: () => Promise<void>) => { await f(); console.log(`ok ${++n} - ${name}`); };

await test('bundled data passes the runtime validator (guards drift with build-time validation)', async () => {
  const r = validateContent(base);
  assert.ok(r.ok, JSON.stringify(r.ok ? [] : r.issues));
});

await test('validator rejects bad data', async () => {
  const b = clone(base); b.events[0].time = '25:00'; b.events[1].id = b.events[2].id; (b.events[3] as any).bogus = 1; b.contacts[0].phone = '12';
  const r = validateContent(b);
  assert.ok(!r.ok);
  const paths = (r as any).issues.map((i: any) => i.path).join('|');
  assert.match(paths, /time/); assert.match(paths, /id/); assert.match(paths, /bogus/); assert.match(paths, /phone/);
});

await test('public content works with no storage configured (site keeps built-in data)', async () => {
  const r = await j(await publicGet());
  assert.deepEqual(r.body, { rev: 0, at: null, content: null });
});

process.env.KV_REST_API_URL = 'https://fake.upstash.io'; process.env.KV_REST_API_TOKEN = 't';

await test('login is disabled until ADMIN_USER/ADMIN_PASS are set', async () => {
  assert.equal((await j(await loginPost(req('POST', { username: 'rajat', password: 'paridhi' })))).status, 503);
  assert.equal((await j(await adminGet(req('GET')))).status, 503);
});

process.env.ADMIN_USER = 'rajat'; process.env.ADMIN_PASS = 'paridhi';
let token = '';

await test('login: wrong password 401, right one issues token; username is case/space-insensitive', async () => {
  assert.equal((await j(await loginPost(req('POST', { username: 'rajat', password: 'nope' })))).status, 401);
  const ok = await j(await loginPost(req('POST', { username: ' Rajat ', password: 'paridhi' })));
  assert.equal(ok.status, 200); token = ok.body.token; assert.ok(token.includes('.'));
  assert.equal((await j(await loginPost(req('POST', { username: 'rajat', password: 'Paridhi' })))).status, 401, 'password is case-sensitive');
});

await test('brute force is locked out after 10 failures, even with the right password', async () => {
  for (let i = 0; i < 10; i++) await loginPost(req('POST', { username: 'rajat', password: `x${i}` }, undefined, '9.9.9.9'));
  assert.equal((await j(await loginPost(req('POST', { username: 'rajat', password: 'paridhi' }, undefined, '9.9.9.9')))).status, 429);
  assert.equal((await j(await loginPost(req('POST', { username: 'rajat', password: 'paridhi' }, undefined, '2.2.2.2')))).status, 200, 'other IPs unaffected');
});

await test('admin endpoints reject missing, forged and tampered tokens', async () => {
  assert.equal((await j(await adminGet(req('GET')))).status, 401);
  assert.equal((await j(await adminGet(req('GET', undefined, 'abc.def')))).status, 401);
  const [p, s] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ u: 'rajat', exp: Date.now() + 1e9 })).toString('base64url');
  assert.equal((await j(await adminGet(req('GET', undefined, `${forged}.${s}`)))).status, 401);
  assert.equal((await j(await adminGet(req('GET', undefined, `${p}.${s}x`)))).status, 401);
  const expired = Buffer.from(JSON.stringify({ u: 'rajat', exp: Date.now() - 1 })).toString('base64url');
  assert.equal((await j(await adminGet(req('GET', undefined, `${expired}.${s}`)))).status, 401);
});

await test('initial state: nothing published', async () => {
  const r = await j(await adminGet(req('GET', undefined, token)));
  assert.equal(r.status, 200); assert.equal(r.body.rev, 0); assert.equal(r.body.content, null); assert.deepEqual(r.body.history, []);
});

await test('publish rejects invalid content with field issues and stores nothing', async () => {
  const bad = clone(base); bad.events[0].mapLink = 'http://insecure';
  const r = await j(await adminPut(req('PUT', { baseRev: 0, content: bad }, token)));
  assert.equal(r.status, 422); assert.ok(r.body.issues.length);
  assert.equal((await j(await publicGet())).body.rev, 0);
});

await test('publish stores content, stamps lastUpdated (IST), and guests receive it', async () => {
  const c = clone(base); c.events[0].time = '11:15'; c.meta.lastUpdated = '2000-01-01T00:00:00+05:30';
  const r = await j(await adminPut(req('PUT', { baseRev: 0, content: c, note: 'first' }, token)));
  assert.equal(r.status, 200); assert.equal(r.body.rev, 1);
  assert.match(r.body.content.meta.lastUpdated, /^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\+05:30$/);
  assert.notEqual(r.body.content.meta.lastUpdated, '2000-01-01T00:00:00+05:30');
  const pub = await j(await publicGet());
  assert.equal(pub.body.rev, 1); assert.equal(pub.body.content.events[0].time, '11:15');
});

await test('stale baseRev is a 409 conflict and does not overwrite', async () => {
  const c = clone(base); c.events[0].time = '09:00';
  const r = await j(await adminPut(req('PUT', { baseRev: 0, content: c }, token)));
  assert.equal(r.status, 409); assert.equal(r.body.rev, 1);
  assert.equal((await j(await publicGet())).body.content.events[0].time, '11:15');
});

await test('two simultaneous publishes from the same base: exactly one wins', async () => {
  const a = clone(base), b = clone(base); a.events[0].time = '01:00'; b.events[0].time = '02:00';
  const res = await Promise.all([adminPut(req('PUT', { baseRev: 1, content: a }, token)), adminPut(req('PUT', { baseRev: 1, content: b }, token))].map((p) => p.then(j)));
  assert.deepEqual(res.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await j(await publicGet())).body.rev, 2);
});

await test('history lists versions newest first', async () => {
  const r = await j(await adminGet(req('GET', undefined, token)));
  assert.deepEqual(r.body.history.map((h: any) => h.rev), [2, 1]); assert.equal(r.body.history[1].note, 'first');
});

await test('restore republishes an old version as a NEW revision', async () => {
  const r = await j(await restorePost(req('POST', { rev: 1 }, token)));
  assert.equal(r.status, 200); assert.equal(r.body.rev, 3); assert.equal(r.body.content.events[0].time, '11:15');
  assert.equal((await j(await restorePost(req('POST', { rev: 99 }, token)))).status, 404);
  assert.equal((await j(await restorePost(req('POST', { rev: 'x' }, token)))).status, 400);
});

await test('reset publishes "use built-in data" (content null) and is itself restorable', async () => {
  const r = await j(await adminDelete(req('DELETE', { baseRev: 3 }, token)));
  assert.equal(r.status, 200); assert.equal(r.body.rev, 4);
  assert.equal((await j(await publicGet())).body.content, null);
  const back = await j(await restorePost(req('POST', { rev: 3 }, token)));
  assert.equal(back.status, 200); assert.equal((await j(await publicGet())).body.content.events[0].time, '11:15');
});

await test('a crashed publish leaves an orphan snapshot but never wedges future publishes (lock expires)', async () => {
  const cur = (await j(await adminGet(req('GET', undefined, token)))).body.rev;
  db.set(`site:content:${cur + 1}`, '"orphan"');
  const r = await j(await adminPut(req('PUT', { baseRev: cur, content: clone(base) }, token)));
  assert.equal(r.status, 200); assert.equal(r.body.rev, cur + 1);
  assert.notEqual(JSON.parse(db.get(`site:content:${cur + 1}`)!), 'orphan');
});

await test('a held revision lock blocks a second publisher (409) until it expires', async () => {
  const cur = (await j(await adminGet(req('GET', undefined, token)))).body.rev;
  db.set(`site:lock:${cur + 1}`, 'held');
  assert.equal((await j(await adminPut(req('PUT', { baseRev: cur, content: clone(base) }, token)))).status, 409);
  db.delete(`site:lock:${cur + 1}`); // simulate TTL expiry
  assert.equal((await j(await adminPut(req('PUT', { baseRev: cur, content: clone(base) }, token)))).status, 200);
});

await test('corrupt stored content is never served to guests', async () => {
  db.set('site:current', JSON.stringify({ rev: 77, at: 'x', content: { events: [], contacts: [], meta: {} } }));
  const r = await j(await publicGet());
  assert.equal(r.body.rev, 77); assert.equal(r.body.content, null);
});

console.log(`\nAll ${n} admin API tests passed.`);
