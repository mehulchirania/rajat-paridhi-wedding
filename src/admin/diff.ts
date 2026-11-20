import type { Content } from '../lib/data';

type Rec = Record<string, unknown>;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const show = (v: unknown): string => {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'object') { const o = v as Rec; return typeof o.en === 'string' ? `“${o.en}”` : 'changed'; }
  return String(v);
};
const FIELD: Record<string, string> = { venueName: 'venue', mapLink: 'map link', needsConfirmation: 'needs confirmation', timeBySide: 'per-side time', openEnded: 'open-ended', durationMin: 'duration', dressCode: 'dress code', hiDraft: 'Hindi draft' };

function byId(list: unknown[]): Map<string, Rec> { return new Map((list as Rec[]).map((x) => [String(x.id), x])); }
const label = (x: Rec) => (typeof x.name === 'string' ? x.name : typeof (x.name as Rec)?.en === 'string' ? String((x.name as Rec).en) : typeof (x.title as Rec)?.en === 'string' ? String((x.title as Rec).en) : String(x.id));

function diffList(kind: string, a: unknown[], b: unknown[], extra?: (x: Rec) => string): string[] {
  const out: string[] = [];
  const A = byId(a), B = byId(b);
  for (const [id, y] of B) {
    const x = A.get(id);
    if (!x) { out.push(`Added ${kind}: ${label(y)}${extra ? ` (${extra(y)})` : ''}`); continue; }
    const changes: string[] = [];
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (!same(x[k], y[k])) changes.push(`${FIELD[k] ?? k} ${show(x[k])} → ${show(y[k])}`);
    if (changes.length) out.push(`${label(y)}: ${changes.join('; ')}`);
  }
  for (const [id, x] of A) if (!B.has(id)) out.push(`Removed ${kind}: ${label(x)}`);
  return out;
}

/** Human-readable list of what differs between the published data and the draft. */
export function summarize(base: Content, draft: Content): string[] {
  const out = [
    ...diffList('event', base.events, draft.events, (e) => `${e.date} ${e.time ?? 'TBD'}`),
    ...diffList('contact', base.contacts, draft.contacts),
  ];
  const A = base.meta as unknown as Rec, B = draft.meta as unknown as Rec;
  const names: Record<string, string> = { announcements: 'Notices', couple: 'Couple & family names', hotel: 'Hotel info', teaCoffee: 'Tea/coffee line' };
  for (const k of Object.keys(names)) if (!same(A[k], B[k])) out.push(`${names[k]} changed`);
  return out;
}
