// Runtime validation of the editable site content. Used by BOTH the API (authoritative, blocks bad saves)
// and the client (admin form feedback + refusing to apply malformed remote content).
// Mirrors src/data/events.schema.json and scripts/validate-data.mjs — keep the three in sync.

export interface Issue { path: string; msg: string }
export interface Content { events: unknown[]; contacts: unknown[]; meta: Record<string, unknown> }
export type Result = { ok: true; content: Content } | { ok: false; issues: Issue[] };

export const TYPES = ['ritual', 'meal', 'celebration'] as const;
export const SIDES = ['groom', 'bride', 'common'] as const;
export const CITIES = ['Pune', 'Indore', 'TBD'] as const;
export const SWATCHES = ['lehariya', 'purple', 'pastel', 'indo-western', 'traditional', 'any'] as const;
export const AUDIENCES = ['all', 'family'] as const;
export const STATUSES = ['confirmed', 'tbd'] as const;
export const MAX_BYTES = 400_000;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]+$/;
const E164 = /^[1-9]\d{7,14}$/;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const realDate = (s: string) => DATE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

const EVENT_KEYS = new Set(['id', 'type', 'side', 'city', 'venueName', 'area', 'room', 'title', 'time', 'openEnded', 'durationMin', 'timeBySide', 'date', 'dressCode', 'notes', 'transport', 'mapLink', 'audience', 'status', 'needsConfirmation', 'icon', 'hiDraft']);

export function validateContent(input: unknown): Result {
  const issues: Issue[] = [];
  const add = (path: string, msg: string) => issues.push({ path, msg });

  if (!isObj(input)) return { ok: false, issues: [{ path: '', msg: 'Content must be an object with events, contacts and meta.' }] };
  const { events, contacts, meta } = input as Record<string, unknown>;
  try { if (JSON.stringify(input).length > MAX_BYTES) add('', 'Content is too large.'); } catch { add('', 'Content is not serialisable.'); }

  const l10n = (v: unknown, path: string, required: boolean) => {
    if (v === undefined || v === null) { if (required) add(path, 'Required.'); return; }
    if (!isObj(v)) return add(path, 'Must be {en, hi}.');
    for (const k of Object.keys(v)) if (k !== 'en' && k !== 'hi') add(path, `Unknown key "${k}".`);
    if (!isStr(v.en) || !v.en.trim()) add(path, 'English text is required.');
    if (v.hi !== undefined && !isStr(v.hi)) add(path, 'Hindi must be text.');
  };
  const oneOf = (v: unknown, list: readonly string[], path: string) => { if (!isStr(v) || !list.includes(v)) add(path, `Must be one of: ${list.join(', ')}.`); };
  const https = (v: unknown, path: string) => { if (!isStr(v) || !/^https:\/\/\S+$/.test(v)) add(path, 'Must be a link starting with https://'); };

  // ---- events ----
  if (!Array.isArray(events) || events.length === 0) add('events', 'At least one event is required.');
  else {
    const seen = new Set<string>();
    events.forEach((raw, i) => {
      if (!isObj(raw)) return add(`events[${i}]`, 'Must be an object.');
      const id = isStr(raw.id) ? raw.id : `#${i + 1}`;
      const p = (f: string) => `events.${id}.${f}`;
      for (const k of Object.keys(raw)) if (!EVENT_KEYS.has(k)) add(p(k), 'Unknown field.');
      if (!isStr(raw.id) || !ID.test(raw.id)) add(p('id'), 'Id must be lowercase letters, digits and dashes.');
      else if (seen.has(raw.id)) add(p('id'), 'Duplicate id.'); else seen.add(raw.id);
      oneOf(raw.type, TYPES, p('type')); oneOf(raw.side, SIDES, p('side')); oneOf(raw.city, CITIES, p('city'));
      oneOf(raw.audience, AUDIENCES, p('audience')); oneOf(raw.status, STATUSES, p('status'));
      l10n(raw.title, p('title'), true);
      for (const f of ['area', 'room', 'notes', 'transport']) l10n(raw[f], p(f), false);
      if (raw.venueName !== undefined && raw.venueName !== null && !isStr(raw.venueName)) add(p('venueName'), 'Must be text.');
      if (!isStr(raw.date) || !realDate(raw.date)) add(p('date'), 'Must be a valid date (YYYY-MM-DD).');
      if (raw.time !== undefined && raw.time !== null && (!isStr(raw.time) || !TIME.test(raw.time))) add(p('time'), 'Must be a time like 18:30.');
      if (!raw.time && raw.status !== 'tbd') add(p('time'), 'Time is required unless the event is marked "timing TBD".');
      if (raw.timeBySide !== undefined) {
        if (!isObj(raw.timeBySide)) add(p('timeBySide'), 'Must be {groom, bride}.');
        else for (const [k, v] of Object.entries(raw.timeBySide)) {
          if (k !== 'groom' && k !== 'bride') add(p('timeBySide'), `Unknown key "${k}".`);
          else if (!isStr(v) || !TIME.test(v)) add(p(`timeBySide.${k}`), 'Must be a time like 18:30.');
        }
      }
      if (raw.durationMin !== undefined && (!Number.isInteger(raw.durationMin) || (raw.durationMin as number) < 5 || (raw.durationMin as number) > 1440)) add(p('durationMin'), 'Must be a whole number of minutes between 5 and 1440.');
      for (const f of ['openEnded', 'needsConfirmation', 'hiDraft']) if (raw[f] !== undefined && typeof raw[f] !== 'boolean') add(p(f), 'Must be true or false.');
      if (typeof raw.needsConfirmation !== 'boolean') add(p('needsConfirmation'), 'Required.');
      if (raw.mapLink !== undefined) https(raw.mapLink, p('mapLink'));
      if (raw.icon !== undefined && !isStr(raw.icon)) add(p('icon'), 'Must be text.');
      if (raw.dressCode !== undefined) {
        const d = raw.dressCode;
        if (!isObj(d)) add(p('dressCode'), 'Must be {en, hi, swatch}.');
        else {
          for (const k of Object.keys(d)) if (!['en', 'hi', 'swatch'].includes(k)) add(p('dressCode'), `Unknown key "${k}".`);
          if (!isStr(d.en) || !d.en.trim()) add(p('dressCode'), 'English dress code text is required.');
          if (d.hi !== undefined && !isStr(d.hi)) add(p('dressCode'), 'Hindi must be text.');
          oneOf(d.swatch, SWATCHES, p('dressCode.swatch'));
        }
      }
    });
  }

  // ---- contacts ----
  if (!Array.isArray(contacts)) add('contacts', 'Must be a list.');
  else {
    const seen = new Set<string>();
    contacts.forEach((raw, i) => {
      if (!isObj(raw)) return add(`contacts[${i}]`, 'Must be an object.');
      const id = isStr(raw.id) ? raw.id : `#${i + 1}`;
      const p = (f: string) => `contacts.${id}.${f}`;
      if (!isStr(raw.id) || !ID.test(raw.id)) add(p('id'), 'Id must be lowercase letters, digits and dashes.');
      else if (seen.has(raw.id)) add(p('id'), 'Duplicate id.'); else seen.add(raw.id);
      if (typeof raw.active !== 'boolean') add(p('active'), 'Required.');
      if (raw.kind === 'family') {
        oneOf(raw.side, ['groom', 'bride'], p('side'));
        oneOf(raw.role, ['stay-transport', 'timings'], p('role'));
        if (!isStr(raw.name) || !raw.name.trim()) add(p('name'), 'Name is required.');
        if (!isStr(raw.phone) || !E164.test(raw.phone)) add(p('phone'), 'Phone must be digits with country code, e.g. 919876543210.');
        if (raw.relation !== undefined) l10n(raw.relation, p('relation'), false);
        if (raw.city !== undefined && !isStr(raw.city)) add(p('city'), 'Must be text.');
        if (raw.dateRange !== undefined) {
          const r = raw.dateRange;
          if (!isObj(r) || !isStr(r.from) || !isStr(r.to) || !realDate(r.from) || !realDate(r.to)) add(p('dateRange'), 'Must be {from, to} dates.');
        }
      } else if (raw.kind === 'venue') {
        l10n(raw.name, p('name'), true);
        if (!Array.isArray(raw.phones) || raw.phones.length === 0) add(p('phones'), 'At least one phone is required.');
        else for (const ph of raw.phones) if (!isStr(ph) || !E164.test(ph)) add(p('phones'), `Bad phone "${String(ph)}" — digits with country code.`);
      } else add(p('kind'), 'Must be "family" or "venue".');
    });
  }

  // ---- meta ----
  if (!isObj(meta)) add('meta', 'Required.');
  else {
    if (!isStr(meta.lastUpdated) || Number.isNaN(Date.parse(meta.lastUpdated))) add('meta.lastUpdated', 'Must be an ISO date.');
    if (!Array.isArray(meta.announcements)) add('meta.announcements', 'Must be a list.');
    else {
      const seen = new Set<string>();
      meta.announcements.forEach((a, i) => {
        if (!isObj(a)) return add(`meta.announcements[${i}]`, 'Must be an object.');
        const p = `meta.announcements.${isStr(a.id) ? a.id : `#${i + 1}`}`;
        if (!isStr(a.id) || !a.id) add(`${p}.id`, 'Required.'); else if (seen.has(a.id)) add(`${p}.id`, 'Duplicate id.'); else seen.add(a.id);
        if (typeof a.active !== 'boolean') add(`${p}.active`, 'Required.');
        l10n(a.text, `${p}.text`, true);
      });
    }
    const couple = meta.couple;
    if (!isObj(couple)) add('meta.couple', 'Required.');
    else for (const s of ['groom', 'bride']) {
      const c = couple[s];
      if (!isObj(c)) add(`meta.couple.${s}`, 'Required.');
      else { l10n(c.name, `meta.couple.${s}.name`, true); l10n(c.parents, `meta.couple.${s}.parents`, true); }
    }
    const hotel = meta.hotel;
    if (!isObj(hotel)) add('meta.hotel', 'Required.');
    else {
      if (!isStr(hotel.name) || !hotel.name.trim()) add('meta.hotel.name', 'Required.');
      for (const f of ['address', 'parking', 'inRoom']) l10n(hotel[f], `meta.hotel.${f}`, true);
      https(hotel.mapLink, 'meta.hotel.mapLink');
    }
    l10n(meta.teaCoffee, 'meta.teaCoffee', true);
  }

  return issues.length ? { ok: false, issues } : { ok: true, content: input as unknown as Content };
}
