import { json } from './_lib/auth.js';
import { redisConfigured } from './_lib/redis.js';
import { getCurrent } from './_lib/store.js';

/** Public: the latest published content for guests. With no storage / nothing published, guests keep the built-in data. */
export async function GET(): Promise<Response> {
  if (!redisConfigured()) return json({ rev: 0, at: null, content: null }, 200, { 'Cache-Control': 'public, s-maxage=60' });
  try {
    const cur = await getCurrent();
    return json(cur, 200, { 'Cache-Control': 'public, max-age=0, s-maxage=10' });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
