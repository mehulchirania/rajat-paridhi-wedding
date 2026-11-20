import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cmd, redisConfigured } from './redis.js';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_FAILS = 10;
const LOCK_SECONDS = 15 * 60;

const sha = (s: string) => createHash('sha256').update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

export const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });

function creds() {
  const user = process.env.ADMIN_USER?.trim();
  const pass = process.env.ADMIN_PASS;
  return user && pass ? { user, pass } : null;
}
const secret = (c: { user: string; pass: string }) => process.env.ADMIN_SECRET || `wedding-admin|${c.user}|${c.pass}`;
const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string, key: string) => createHmac('sha256', key).update(payload).digest('base64url');

export function issueToken(): { token: string; expiresAt: number } {
  const c = creds()!;
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = b64(JSON.stringify({ u: c.user, exp: expiresAt }));
  return { token: `${payload}.${sign(payload, secret(c))}`, expiresAt };
}

export function verifyRequest(req: Request): boolean {
  const c = creds();
  if (!c) return false;
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (!safeEq(sig, sign(payload, secret(c)))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

/** Returns a Response when the caller must stop (not configured / unauthorised), otherwise null. */
export function guard(req: Request): Response | null {
  if (!creds()) return json({ error: 'Admin login is not configured. Set ADMIN_USER and ADMIN_PASS in the Vercel project settings.' }, 503);
  if (!redisConfigured()) return json({ error: 'Storage is not configured. Connect an Upstash Redis database to the Vercel project.' }, 503);
  if (!verifyRequest(req)) return json({ error: 'Please sign in again.' }, 401);
  return null;
}

const ip = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

/** Username is case-insensitive and trimmed (phone keyboards capitalise); password is exact. */
export async function login(req: Request): Promise<Response> {
  const c = creds();
  if (!c) return json({ error: 'Admin login is not configured. Set ADMIN_USER and ADMIN_PASS in the Vercel project settings.' }, 503);
  if (!redisConfigured()) return json({ error: 'Storage is not configured. Connect an Upstash Redis database to the Vercel project.' }, 503);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Bad request.' }, 400); }
  const key = `site:fails:${ip(req)}`;
  const fails = Number(await cmd<string | null>('GET', key)) || 0;
  if (fails >= MAX_FAILS) return json({ error: 'Too many wrong attempts. Try again in 15 minutes.' }, 429);
  const u = String(body?.username ?? '').trim().toLowerCase(), p = String(body?.password ?? '');
  const ok = safeEq(u, c.user.toLowerCase()) && safeEq(p, c.pass);
  if (!ok) {
    await cmd('INCR', key); await cmd('EXPIRE', key, LOCK_SECONDS);
    return json({ error: 'Wrong username or password.' }, 401);
  }
  if (fails) await cmd('DEL', key);
  return json(issueToken());
}
