// Minimal Upstash/Vercel-KV REST client (no dependency). Env is read lazily so tests can set it.
type Arg = string | number;

function conf() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}
export const redisConfigured = () => !!conf();

async function call(path: string, body: unknown): Promise<any> {
  const c = conf();
  if (!c) throw new Error('Storage is not configured');
  const res = await fetch(`${c.url}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Storage error ${res.status}`);
  return json;
}

export async function cmd<T = unknown>(...args: Arg[]): Promise<T> {
  const json = await call('', args);
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

export async function pipeline(cmds: Arg[][]): Promise<unknown[]> {
  const json = await call('/pipeline', cmds);
  if (!Array.isArray(json)) throw new Error('Bad pipeline response');
  return json.map((r: any) => { if (r.error) throw new Error(r.error); return r.result; });
}
