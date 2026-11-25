import { istToday } from './time';

const KEY = 'petals-shown-2026-12-01';
let decided: boolean | undefined;

/**
 * True once (per device) if today in IST is 2026-12-01 and the flag isn't set.
 * The flag is written by markWeddingDayShowerDone() when the shower finishes, so an interrupted shower replays.
 * Memoised for the page session so re-renders / StrictMode double-renders stay consistent.
 * Honours the ?now= testing override via istToday(). Clear localStorage "petals-shown-2026-12-01" to retest.
 */
export function useWeddingDayShower(): boolean {
  if (decided === undefined) {
    try { decided = istToday() === '2026-12-01' && !localStorage.getItem(KEY); } catch { decided = false; }
  }
  return decided;
}

export function markWeddingDayShowerDone() {
  decided = false;
  try { localStorage.setItem(KEY, '1'); } catch { /* storage blocked */ }
}
