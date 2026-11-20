import { days } from './data';
import { istToday } from './time';

/** Preserve the ?now= test override across in-app navigation. */
export const keep = (): string => {
  try { const n = new URLSearchParams(window.location.search).get('now'); return n ? `?now=${encodeURIComponent(n)}` : ''; } catch { return ''; }
};

/** Today's day if it is an event day, otherwise clamp to first/last day. */
export function defaultDaySlug(): string {
  const today = istToday();
  const hit = days.find((d) => d.date === today);
  if (hit) return hit.slug;
  return (today < days[0].date ? days[0] : days[days.length - 1]).slug;
}
