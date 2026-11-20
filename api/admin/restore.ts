import { guard, json } from '../_lib/auth.js';
import { Conflict, getCurrent, istNow, publish, snapshot } from '../_lib/store.js';

/** Re-publish an older revision as a NEW revision (history is never rewritten). Body: { rev }. */
export async function POST(req: Request): Promise<Response> {
  const g = guard(req); if (g) return g;
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Bad request.' }, 400); }
  if (!Number.isInteger(body?.rev) || body.rev < 1) return json({ error: 'Bad revision.' }, 400);
  try {
    const snap = await snapshot(body.rev);
    if (!snap.found) return json({ error: 'That version no longer exists.' }, 404);
    const cur = await getCurrent();
    const content = snap.content ? { ...snap.content, meta: { ...snap.content.meta, lastUpdated: istNow() } } : null;
    const next = await publish(content, cur.rev, `Restored version ${body.rev}`, 'restore');
    return json({ rev: next.rev, at: next.at, content: next.content });
  } catch (e) {
    return e instanceof Conflict ? json({ error: 'Someone else published at the same moment. Try again.', rev: e.rev }, 409) : json({ error: 'Could not reach storage. Try again.' }, 502);
  }
}
