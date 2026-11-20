// All event times are wall-clock Asia/Kolkata strings. We never convert via the device timezone:
// instants are built with an explicit +05:30 offset (India has no DST), so a wrong device clock
// timezone cannot shift anything.
import type { Lang } from '../types';

export const IST_OFFSET = '+05:30';
export const toInstant = (date: string, time: string): number => Date.parse(`${date}T${time}:00${IST_OFFSET}`);

/** Current time in IST as epoch ms, honouring ?now=YYYY-MM-DDTHH:mm (IST) for testing. */
export function nowMs(): number {
  try {
    const p = new URLSearchParams(window.location.search).get('now');
    if (p && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(p)) {
      const t = Date.parse(`${p}:00${IST_OFFSET}`);
      if (!Number.isNaN(t)) return t;
    }
  } catch { /* ignore */ }
  return Date.now();
}

const istDateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
/** YYYY-MM-DD for "today" in IST. */
export const istToday = (ms = nowMs()): string => istDateFmt.format(new Date(ms));

export const addDays = (date: string, n: number): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
export const monthIdx = (date: string) => Number(date.slice(5, 7)) - 1;
export const dayNum = (date: string) => Number(date.slice(8, 10));

/** "1-dec" style route slug. */
const MON = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
export const dateToSlug = (date: string) => `${dayNum(date)}-${MON[monthIdx(date)]}`;

export function formatTime(time: string, lang: Lang): string {
  const [h, m] = time.split(':').map(Number);
  const mm = String(m).padStart(2, '0');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === 'hi') {
    const p = h < 4 ? 'रात' : h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : h < 19 ? 'शाम' : 'रात';
    return `${p} ${h12}:${mm}`;
  }
  return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

export function endInstant(startMs: number, durationMin: number): number {
  return startMs + durationMin * 60_000; // may cross midnight; instants don't care
}
