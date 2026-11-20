import type { Content } from '../../shared/validate.js';
import { validateContent } from '../../shared/validate.js';
import { cmd, pipeline } from './redis.js';

// Keys (never deleted, so history is free):
//   site:current        {rev, at, content|null}   what guests get (single read)
//   site:content:<n>    JSON content | "null"     immutable snapshot of revision n (null = "use built-in data")
//   site:meta:<n>       {rev, at, note, kind}     small history entry
// Writes first take SET NX site:lock:<next> (30s TTL) so two simultaneous publishers can never silently overwrite each other.
export interface Current { rev: number; at: string | null; content: Content | null }
export interface HistoryItem { rev: number; at: string; note: string; kind: 'save' | 'reset' | 'restore' }
export class Conflict extends Error { constructor(public rev: number) { super('conflict'); } }

const HISTORY_LEN = 30;

export async function getCurrent(): Promise<Current> {
  const raw = await cmd<string | null>('GET', 'site:current');
  if (!raw) return { rev: 0, at: null, content: null };
  const cur = JSON.parse(raw) as Current;
  // Defence in depth: never serve content that fails validation.
  if (cur.content && !validateContent(cur.content).ok) return { rev: cur.rev, at: cur.at, content: null };
  return cur;
}

/** IST wall-clock ISO string, e.g. 2026-11-21T00:45:00+05:30 (matches meta.lastUpdated format). */
export function istNow(d = new Date()): string {
  const ist = new Date(d.getTime() + 330 * 60_000);
  return `${ist.toISOString().slice(0, 19)}+05:30`;
}

export async function publish(content: Content | null, baseRev: number, note: string, kind: HistoryItem['kind']): Promise<Current> {
  const cur = await getCurrent();
  if (cur.rev !== baseRev) throw new Conflict(cur.rev);
  const rev = cur.rev + 1;
  const at = istNow();
  // Per-revision lock: only one publisher can claim revision N+1. It expires by itself (30s) so a crashed publish can't wedge saving.
  const locked = await cmd<string | null>('SET', `site:lock:${rev}`, at, 'NX', 'EX', 30);
  if (locked !== 'OK') throw new Conflict(cur.rev);
  await cmd('SET', `site:content:${rev}`, JSON.stringify(content));
  const next: Current = { rev, at, content };
  const item: HistoryItem = { rev, at, note: note.slice(0, 200), kind };
  await pipeline([['SET', `site:meta:${rev}`, JSON.stringify(item)], ['SET', 'site:current', JSON.stringify(next)]]);
  return next;
}

export async function history(currentRev: number): Promise<HistoryItem[]> {
  const revs: number[] = [];
  for (let r = currentRev; r >= 1 && revs.length < HISTORY_LEN; r--) revs.push(r);
  if (!revs.length) return [];
  const rows = await pipeline(revs.map((r) => ['GET', `site:meta:${r}`]));
  return rows.map((x) => (x ? (JSON.parse(x as string) as HistoryItem) : null)).filter((x): x is HistoryItem => !!x);
}

export async function snapshot(rev: number): Promise<{ found: boolean; content: Content | null }> {
  const raw = await cmd<string | null>('GET', `site:content:${rev}`);
  if (raw === null || raw === undefined) return { found: false, content: null };
  return { found: true, content: JSON.parse(raw) as Content | null };
}
