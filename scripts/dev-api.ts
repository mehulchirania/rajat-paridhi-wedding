// Local stand-in for Vercel Functions + Upstash so you can try /admin with `npm run dev` (data lives in memory only).
// Run in a second terminal: npm run dev:api   (login: rajat / paridhi unless ADMIN_USER/ADMIN_PASS are set)
import http from 'node:http';

const db = new Map<string, string>();
const run = (a: (string | number)[]): unknown => {
  const [c, k, v, opt] = a as string[];
  if (c === 'GET') return db.get(k) ?? null;
  if (c === 'SET') { if (opt === 'NX' && db.has(k)) return null; db.set(k, v); return 'OK'; }
  if (c === 'INCR') { const n = (Number(db.get(k)) || 0) + 1; db.set(k, String(n)); return n; }
  if (c === 'EXPIRE') return 1;
  if (c === 'DEL') return db.delete(k) ? 1 : 0;
  throw new Error(`unsupported ${c}`);
};
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string, init: RequestInit) => {
  if (!String(url).startsWith('http://fake-redis')) return realFetch(url, init);
  const body = JSON.parse(init.body as string);
  return new Response(JSON.stringify(String(url).endsWith('/pipeline') ? body.map((c: (string | number)[]) => ({ result: run(c) })) : { result: run(body) }));
}) as typeof fetch;
process.env.KV_REST_API_URL = 'http://fake-redis'; process.env.KV_REST_API_TOKEN = 'dev';
process.env.ADMIN_USER ||= 'rajat'; process.env.ADMIN_PASS ||= 'paridhi';

const routes: Record<string, () => Promise<Record<string, (r: Request) => Promise<Response> | Response>>> = {
  '/api/content': () => import('../api/content'),
  '/api/admin/login': () => import('../api/admin/login'),
  '/api/admin/content': () => import('../api/admin/content'),
  '/api/admin/restore': () => import('../api/admin/restore'),
};
const port = Number(process.env.PORT) || 3001;
http.createServer(async (rq, rs) => {
  const path = (rq.url || '').split('?')[0];
  const chunks: Buffer[] = []; for await (const c of rq) chunks.push(c as Buffer);
  const mod = routes[path] && (await routes[path]());
  const h = mod?.[rq.method || 'GET'];
  if (!h) { rs.writeHead(404); rs.end(); return; }
  const res = await h(new Request(`http://localhost${rq.url}`, { method: rq.method, headers: rq.headers as Record<string, string>, body: ['GET', 'HEAD'].includes(rq.method!) ? undefined : Buffer.concat(chunks) }));
  rs.writeHead(res.status, Object.fromEntries(res.headers)); rs.end(Buffer.from(await res.arrayBuffer()));
}).listen(port, () => console.log(`dev API on http://localhost:${port}  (in-memory, resets on restart)`));
