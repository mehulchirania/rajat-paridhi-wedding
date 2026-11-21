// Live content: the guest site ships with built-in data, and may be overridden by whatever the admin portal last published
// (GET /api/content). The last good copy is cached in localStorage so the site stays correct offline.
import { validateContent } from '../../shared/validate';
import { setContent, type Content } from './data';
import { store } from './storage';

const CACHE_KEY = 'content-cache-v1';
let rev = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

export const getRev = () => rev;
export const subscribeContent = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };

function apply(r: number, content: Content | null) {
  setContent(content);
  rev = r;
}

/** Synchronous, before first render: use the cached override if there is one. */
export function bootFromCache() {
  try {
    const raw = store.get(CACHE_KEY);
    if (!raw) return;
    const c = JSON.parse(raw) as { rev: number; content: Content | null };
    if (c.content === null) { apply(c.rev, null); return; }
    if (validateContent(c.content).ok) apply(c.rev, c.content);
  } catch { /* ignore a corrupt cache */ }
}

/** Fetch the published content; apply it if it is newer than what we show. Never throws. Resolves true when content changed. */
export async function refreshContent(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    const res = await fetch('/api/content', { cache: 'no-cache', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const j = (await res.json()) as { rev?: number; content?: Content | null };
    if (typeof j.rev !== 'number' || j.rev === rev) return false;
    if (j.content && !validateContent(j.content).ok) return false; // never apply malformed content
    store.set(CACHE_KEY, JSON.stringify({ rev: j.rev, content: j.content ?? null }));
    apply(j.rev, j.content ?? null);
    emit();
    return true;
  } catch { return false; }
}

/** Check on start, when the app returns to the foreground, when the network returns, and every 3 minutes. */
export function startAutoRefresh(): () => void {
  void refreshContent();
  const onVis = () => { if (document.visibilityState === 'visible') void refreshContent(); };
  const onOnline = () => { void refreshContent(); };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('online', onOnline);
  const t = window.setInterval(onVis, 3 * 60 * 1000);
  return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', onOnline); window.clearInterval(t); };
}
