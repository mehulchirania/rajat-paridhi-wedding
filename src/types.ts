export type Lang = 'en' | 'hi';
export type Side = 'groom' | 'bride' | 'common';
export type GuestSide = 'groom' | 'bride' | 'both';
export interface L10n { en: string; hi?: string }
export type Swatch = 'lehariya' | 'purple' | 'pastel' | 'indo-western' | 'traditional' | 'any';

export interface EventItem {
  id: string;
  type: 'ritual' | 'meal' | 'celebration';
  side: Side;
  city: 'Pune' | 'Indore' | 'TBD';
  venueName?: string | null;
  area?: L10n;
  room?: L10n;
  title: L10n;
  time?: string | null;
  openEnded?: boolean;
  durationMin?: number;
  timeBySide?: { groom?: string; bride?: string };
  date: string;
  dressCode?: { en: string; hi?: string; swatch: Swatch };
  notes?: L10n;
  transport?: L10n;
  mapLink?: string;
  audience: 'all' | 'family';
  status: 'confirmed' | 'tbd';
  needsConfirmation: boolean;
  icon?: string;
  hiDraft?: boolean;
}

export interface FamilyContact {
  id: string; kind: 'family'; side: 'groom' | 'bride'; name: string;
  relation?: L10n; role: 'stay-transport' | 'timings'; phone: string;
  city?: string; dateRange?: { from: string; to: string };
  placeholder?: boolean; primary?: boolean; active: boolean;
}
export interface VenueContact { id: string; kind: 'venue'; name: L10n; phones: string[]; active: boolean }
export type Contact = FamilyContact | VenueContact;

export interface Meta {
  lastUpdated: string;
  announcements: { id: string; active: boolean; text: L10n }[];
  couple: Record<'groom' | 'bride', { name: L10n; parents: L10n }>;
  hotel: { name: string; address: L10n; mapLink: string; parking: L10n; inRoom: L10n };
  teaCoffee: L10n;
  gallery: { src: string; alt: L10n }[];
}
