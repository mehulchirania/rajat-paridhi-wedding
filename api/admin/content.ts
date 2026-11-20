import { guard, json } from '../_lib/auth.js';
import { Conflict, getCurrent, history, istNow, publish } from '../_lib/store.js';
import { validateContent } from '../../shared/validate.js';

const fail = (e: unknown) => (e instanceof Conflict
  ? json({ error: 'Someone else published a newer version while you were editing. Reload to get it.', rev: e.rev }, 409)
  : json({ error: 'Could not reach storage. Try again.' }, 502));

/** Current published state + history (for the admin editor). */
export async function GET(req: Request): Promise<Response> {
  const g = guard(req); if (g) return g;
  try {
    const cur = await getCurrent();
    return json({ ...cur, history: await history(cur.rev) });
  } catch (e) { return fail(e); }
}

/** Publish. Body: { baseRev, content, note? }. Validated server-side; lastUpdated is stamped here. */
export async function PUT(req: Request): Promise<Response> {
  const g = guard(req); if (g) return g;
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Bad request.' }, 400); }
  const res = validateContent(body?.content);
  if (!res.ok) return json({ error: 'Some fields are invalid.', issues: res.issues.slice(0, 50) }, 422);
  if (!Number.isInteger(body.baseRev)) return json({ error: 'Missing baseRev.' }, 400);
  try {
    
    const content = { ...res.content, meta: { ...res.content.meta, lastUpdated: istNow() } };
    const next = await publish(content, body.baseRev, String(body.note ?? '') || 'Edited', 'save');
    return json({ rev: next.rev, at: next.at, content: next.content });
  } catch (e) { return fail(e); }
}

/** Reset to the built-in (repo) data. Body: { baseRev }. */
export async function DELETE(req: Request): Promise<Response> {
  const g = guard(req); if (g) return g;
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Bad request.' }, 400); }
  if (!Number.isInteger(body?.baseRev)) return json({ error: 'Missing baseRev.' }, 400);
  try {
    const next = await publish(null, body.baseRev, 'Reset to built-in data', 'reset');
    return json({ rev: next.rev, at: next.at, content: null });
  } catch (e) { return fail(e); }
}
