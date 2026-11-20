import type { Contact, EventItem, FamilyContact, GuestSide, Lang, VenueContact } from '../types';
import { contacts } from './data';

export const familyContacts = contacts.filter((c): c is FamilyContact => c.kind === 'family' && c.active);
export const venueContacts = contacts.filter((c): c is VenueContact => c.kind === 'venue' && c.active);
export type { Contact };

const forSide = (side: 'groom' | 'bride') => familyContacts.filter((c) => c.side === side);
const sides = (view: GuestSide): ('groom' | 'bride')[] => (view === 'both' ? ['groom', 'bride'] : [view]);

/** All family contacts shown for the current view (FAB, Info page). */
export const contactsForView = (view: GuestSide) => sides(view).flatMap(forSide);

function matches(c: FamilyContact, ev: EventItem): boolean {
  if (c.city && c.city !== ev.city) return false;
  if (c.dateRange && (ev.date < c.dateRange.from || ev.date > c.dateRange.to)) return false;
  return true;
}

/** Best contact on `side` for an event: timings role + city/date match, else side primary, else first active. */
export function pickForEvent(side: 'groom' | 'bride', ev: EventItem): FamilyContact | undefined {
  const list = forSide(side);
  const timings = list.filter((c) => c.role === 'timings');
  const specific = timings.find((c) => (c.city || c.dateRange) && matches(c, ev));
  return specific ?? timings.find((c) => !c.city && !c.dateRange) ?? list.find((c) => c.primary) ?? list[0];
}

/** Contacts offered for an event: own side's, or both sides for common events / Both mode. */
export function contactsForEvent(view: GuestSide, ev: EventItem): FamilyContact[] {
  const targets = ev.side === 'common' ? sides(view) : view === 'both' ? [ev.side] : [view];
  return targets.map((s) => pickForEvent(s as 'groom' | 'bride', ev)).filter((c): c is FamilyContact => !!c);
}

/** Built at click time so the number never appears in the DOM. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
export function openWa(phone: string, text: string) {
  window.open(waLink(phone, text), '_blank', 'noopener,noreferrer');
}
export const telHref = (phone: string) => `tel:+${phone}`;
export const prettyPhone = (phone: string, _lang?: Lang) => phone.replace(/^91(\d{5})(\d{5})$/, '$1 $2');
