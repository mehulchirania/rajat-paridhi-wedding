import eventsRaw from '../data/events.json';
import contactsRaw from '../data/contacts.json';
import metaRaw from '../data/meta.json';
import type { Contact, EventItem, GuestSide, Meta, Side } from '../types';
import { dateToSlug, toInstant } from './time';

export interface Day { date: string; slug: string }
export interface Content { events: EventItem[]; contacts: Contact[]; meta: Meta }

/** Built-in data (the JSON files in the repo). Used until/unless the admin portal has published an override. */
export const builtIn: Content = {
  events: eventsRaw as unknown as EventItem[],
  contacts: contactsRaw as unknown as Contact[],
  meta: metaRaw as unknown as Meta,
};

// Live bindings: importers always see the current values after setContent(). The UI re-mounts on change (see ContentGate).
export let events: EventItem[] = builtIn.events;
export let contacts: Contact[] = builtIn.contacts;
export let meta: Meta = builtIn.meta;
export let days: Day[] = [];
export let nikasi: EventItem | undefined;

/** Every non-meal event shows a dress line. Where none is set (in the repo data or in published content),
 *  fall back to "Traditional" on the wedding day and "Your choice" otherwise. An explicit dressCode always wins. */
const DRESS_ANY = { en: 'Your choice', hi: 'अपनी पसंद का', swatch: 'any' } as const;
const DRESS_TRAD = { en: 'Traditional', hi: 'ट्रेडिशनल', swatch: 'traditional' } as const;
const WEDDING_DATE = '2026-12-02';
const withDress = (list: EventItem[]): EventItem[] =>
  list.map((e) => {
    const x = e.needsConfirmation ? { ...e, needsConfirmation: false } : e; // guests never see "timing being confirmed"
    return x.dressCode || x.type === 'meal' ? x : { ...x, dressCode: { ...(x.date === WEDDING_DATE ? DRESS_TRAD : DRESS_ANY) } };
  });

/** Swap the active dataset. `null` restores the built-in data. Callers must have validated `c` first. */
export function setContent(c: Content | null) {
  const src = c ?? builtIn;
  events = withDress(src.events); contacts = src.contacts; meta = src.meta;
  days = [...new Set(events.map((e) => e.date))].sort().map((date) => ({ date, slug: dateToSlug(date) }));
  nikasi = events.find((e) => e.id === 'nikasi-groom-2dec');
}
setContent(null);

export const dayBySlug = (slug?: string) => days.find((d) => d.slug === slug);

/** Time a guest of `view` sees for this event. In "both" mode the canonical time is used. */
export function resolveTime(ev: EventItem, view: GuestSide): string | null {
  if (view !== 'both' && ev.timeBySide?.[view]) return ev.timeBySide[view]!;
  return ev.time ?? null;
}
export function differsBySide(ev: EventItem): boolean {
  const g = ev.timeBySide?.groom, b = ev.timeBySide?.bride;
  return (!!g && g !== ev.time) || (!!b && b !== ev.time);
}

const DEFAULT_DURATION: Record<EventItem['type'], number> = { ritual: 90, meal: 60, celebration: 120 };
export const durationOf = (ev: EventItem) => ev.durationMin ?? (ev.openEnded ? 240 : DEFAULT_DURATION[ev.type]);

export function startMs(ev: EventItem, view: GuestSide): number | null {
  const t = resolveTime(ev, view);
  return t ? toInstant(ev.date, t) : null;
}

export function sideVisible(side: Side, view: GuestSide): boolean {
  return view === 'both' || side === 'common' || side === view;
}

export interface Filter { view: GuestSide; showFamily: boolean }
export function visibleEvents(list: EventItem[], f: Filter): EventItem[] {
  return list.filter((e) => sideVisible(e.side, f.view) && (f.showFamily || e.audience !== 'family'));
}

export function sortEvents(list: EventItem[], view: GuestSide): EventItem[] {
  return [...list].sort((a, b) => {
    const ta = resolveTime(a, view), tb = resolveTime(b, view);
    if (!ta && !tb) return a.id.localeCompare(b.id);
    if (!ta) return 1;
    if (!tb) return -1;
    return ta.localeCompare(tb) || a.id.localeCompare(b.id);
  });
}

export const eventById = (id?: string | null) => (id ? events.find((e) => e.id === id) : undefined);
