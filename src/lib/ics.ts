import type { EventItem, GuestSide, Lang } from '../types';
import { durationOf, meta, resolveTime } from './data';
import { toInstant } from './time';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** RFC 5545 line folding at 75 octets (UTF-8 aware), CRLF-joined. */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export interface IcsText { title: string; where: string; notes: string; confirming: string }

export function buildIcs(ev: EventItem, view: GuestSide, txt: IcsText, siteUrl: string): string | null {
  const time = resolveTime(ev, view);
  if (!time) return null;
  const start = toInstant(ev.date, time);
  const end = start + durationOf(ev) * 60_000; // handles events spanning midnight
  const desc = [txt.notes, ev.needsConfirmation ? txt.confirming : '', siteUrl].filter(Boolean).join('\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rajat Paridhi Wedding//Itinerary//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.id}-${view}@wedding-itinerary`,
    `DTSTAMP:${stamp(Date.parse(meta.lastUpdated))}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(txt.title)}`,
    txt.where ? `LOCATION:${esc(txt.where)}` : '',
    `DESCRIPTION:${esc(desc)}`,
    ev.mapLink ? `URL:${ev.mapLink}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(filename: string, body: string) {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export type { Lang };
