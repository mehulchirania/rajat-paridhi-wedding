import { useMemo, useState, type ReactNode } from 'react';
import type { Issue } from '../../shared/validate';
import { CITIES, SIDES, SWATCHES, TYPES } from '../../shared/validate';
import type { Content } from '../lib/data';
import type { EventItem } from '../types';
import { Btn, Card, Check, Field, L10nInput, PageHead, Select, Text, clean, dateLabel, slug, time12 } from './ui';

const ICONS = ['kumkum', 'mehendi', 'pooja', 'rakhi', 'haldi', 'carnival', 'mayra', 'ring', 'music', 'nikasi', 'travel', 'meet', 'garland', 'phere', 'reception', 'meal', 'tea', 'info'];
const sideCls = { groom: 'bg-groom-soft text-groom-ink', bride: 'bg-bride-soft text-bride-ink', common: 'bg-sand text-ink-2' };
const sideName = { groom: 'Groom side', bride: 'Bride side', common: 'Everyone' };
const SWATCH_LABEL: Record<string, string> = { lehariya: 'Lehariya', purple: 'Purple', pastel: 'Pastel', 'indo-western': 'Indo-western', traditional: 'Traditional', any: 'Anything' };

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const nudge = (t: string, by: number): string => {
  const m = Math.min(1439, Math.max(0, toMin(t) + by));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }

/** Pill buttons for a short list of choices, easier than a dropdown on a phone. */
function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={`min-h-10 rounded-full border px-4 text-[0.9rem] font-semibold ${value === o.v ? 'border-oxblood bg-oxblood text-white' : 'border-line bg-paper text-ink'}`}>{o.label}</button>
      ))}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-sand/60 p-3.5">
      <div>
        <h4 className="text-[0.78rem] font-semibold uppercase tracking-[.12em] text-ink-2">{title}</h4>
        {hint && <p className="text-[0.82rem] text-ink-2">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function EventsTab({ draft, setDraft, issues }: P) {
  const [day, setDay] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const dates = useMemo(() => [...new Set(draft.events.map((e) => e.date))].sort(), [draft.events]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return draft.events
      .filter((e) => (day === 'all' || e.date === day) && (!needle || `${e.title.en} ${e.title.hi ?? ''} ${e.venueName ?? ''}`.toLowerCase().includes(needle)))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '99').localeCompare(b.time ?? '99') || a.id.localeCompare(b.id));
  }, [draft.events, day, q]);
  const groups = useMemo(() => {
    const m = new Map<string, EventItem[]>();
    for (const e of list) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return [...m.entries()];
  }, [list]);

  const update = (id: string, f: (e: EventItem) => EventItem) => setDraft((d) => ({ ...d, events: d.events.map((e) => (e.id === id ? clean(f(e)) : e)) }));
  const remove = (id: string) => { setDraft((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) })); setOpen(null); };
  const add = (from?: EventItem) => {
    const date = from?.date ?? (day !== 'all' ? day : dates[0] ?? '2026-12-01');
    const base = from ?? ({ type: 'ritual', side: 'common', city: 'Indore', venueName: draft.meta.hotel.name, audience: 'all', status: 'confirmed', needsConfirmation: false, time: '10:00', date, title: { en: 'New event' } } as EventItem);
    let id = slug(`${base.title.en}-${date}`), n = 2;
    const have = new Set(draft.events.map((e) => e.id));
    while (have.has(id)) id = `${slug(base.title.en)}-${date}-${n++}`;
    const ev: EventItem = { ...base, id, title: from ? { ...from.title, en: `${from.title.en} (copy)` } : base.title, hiDraft: undefined };
    setDraft((d) => ({ ...d, events: [...d.events, clean(ev)] }));
    setQ(''); setOpen(id);
  };

  return (
    <div className="space-y-4">
      <PageHead title="Events" sub="Tap an event to change its time, place or details. Use “Running late?” above to move a whole day at once." />
      <div className="flex flex-wrap items-center gap-2">
        {['all', ...dates].map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={day === d}
            className={`min-h-10 rounded-full border px-4 text-[0.9rem] font-semibold ${day === d ? 'border-oxblood bg-oxblood text-white' : 'border-line bg-paper text-ink'}`}>
            {d === 'all' ? 'All days' : dateLabel(d)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1"><Text type="search" aria-label="Search events" placeholder="Search events or venues…" value={q} onChange={setQ} /></div>
        <Btn kind="primary" small onClick={() => add()}>+ Add event</Btn>
      </div>

      {groups.map(([date, evs]) => (
        <div key={date} className="space-y-2.5">
          <h3 className="sticky top-0 z-10 -mx-1 bg-ivory/95 px-1 py-1.5 font-display text-[1.2rem] text-ink-2 backdrop-blur">{dateLabel(date)} <span className="text-[0.85rem] font-sans">· {evs.length} event{evs.length === 1 ? '' : 's'}</span></h3>
          {evs.map((e) => {
            const mine = issues.filter((i) => i.path.startsWith(`events.${e.id}.`));
            const isOpen = open === e.id;
            return (
              <Card key={e.id} className={mine.length ? 'border-bride' : isOpen ? 'border-oxblood' : ''}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : e.id)} className="flex min-h-12 w-full items-start gap-3 text-left">
                  <span className="w-[4.6rem] shrink-0 pt-0.5 text-[0.95rem] font-semibold tnum text-ink">{time12(e.time)}{e.openEnded ? '+' : ''}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.25rem] leading-tight text-ink">{e.title.en || '(untitled)'}</span>
                    <span className="mt-0.5 block truncate text-[0.85rem] text-ink-2">{e.venueName || 'Venue to be announced'} · {e.city}</span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5 text-[0.75rem] font-semibold">
                      <span className={`rounded-full px-2 py-0.5 ${sideCls[e.side]}`}>{sideName[e.side]}</span>
                      {e.needsConfirmation && <span className="rounded-full bg-amber-soft px-2 py-0.5 text-amber-ink">timing being confirmed</span>}
                      {e.audience === 'family' && <span className="rounded-full bg-sand px-2 py-0.5 text-ink-2">family only</span>}
                      {e.status === 'tbd' && <span className="rounded-full bg-sand px-2 py-0.5 text-ink-2">time TBD</span>}
                      {mine.length > 0 && <span className="rounded-full bg-bride-soft px-2 py-0.5 text-bride-ink">{mine.length} to fix</span>}
                    </span>
                  </span>
                  <span aria-hidden="true" className="pt-1 text-ink-2">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && <EventForm ev={e} issues={mine} update={(f) => update(e.id, f)} onDuplicate={() => add(e)} onDelete={() => remove(e.id)} onClose={() => setOpen(null)} hotel={draft.meta.hotel.name} />}
              </Card>
            );
          })}
        </div>
      ))}
      {list.length === 0 && <p className="py-8 text-center text-ink-2">{q ? `Nothing matches “${q}”.` : `No events${day !== 'all' ? ' on this day' : ''}.`}</p>}
    </div>
  );
}

function EventForm({ ev, issues, update, onDuplicate, onDelete, onClose, hotel }: { ev: EventItem; issues: Issue[]; update: (f: (e: EventItem) => EventItem) => void; onDuplicate: () => void; onDelete: () => void; onClose: () => void; hotel: string }) {
  const [sure, setSure] = useState(false);
  const err = (f: string) => issues.find((i) => i.path === `events.${ev.id}.${f}` || i.path.startsWith(`events.${ev.id}.${f}.`))?.msg;
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K] | undefined) => update((e) => ({ ...e, [k]: v }));
  const dc = ev.dressCode;
  const sideTime = (s: 'groom' | 'bride', v: string) => update((e) => {
    const next = { ...e.timeBySide, ...(v ? { [s]: v } : {}) };
    if (!v) delete next[s];
    return { ...e, timeBySide: Object.keys(next).length ? next : undefined };
  });
  const hasSideTimes = !!(ev.timeBySide?.groom || ev.timeBySide?.bride);

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      <Section title="What & when">
        <L10nInput label="Event name" required value={ev.title} onChange={(v) => set('title', v ?? { en: '' })} error={err('title')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day" error={err('date')}><Text type="date" value={ev.date} onChange={(v) => set('date', v)} /></Field>
          <Field label="Starts at" error={err('time')}><Text type="time" value={ev.time ?? ''} onChange={(v) => update((e) => ({ ...e, time: v || null }))} /></Field>
        </div>
        {ev.time && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Nudge start time">
            <span className="text-[0.82rem] font-semibold text-ink-2">Nudge:</span>
            {[-60, -30, -15, 15, 30, 60].map((n) => <Btn key={n} small onClick={() => update((e) => ({ ...e, time: nudge(e.time!, n) }))}>{n > 0 ? `+${n}` : n} min</Btn>)}
          </div>
        )}
        <div>
          <Check label="Timing is being confirmed" hint="Guests see a “timing being confirmed” tag." checked={ev.needsConfirmation} onChange={(v) => set('needsConfirmation', v)} />
          <Check label="No fixed end (“12:00 onwards”)" checked={!!ev.openEnded} onChange={(v) => set('openEnded', v || undefined)} />
          <Check label="No time yet (TBD)" checked={ev.status === 'tbd'} onChange={(v) => set('status', v ? 'tbd' : 'confirmed')} />
        </div>
        <details className="rounded-xl border border-line bg-paper px-3 py-2" open={hasSideTimes}>
          <summary className="min-h-9 cursor-pointer text-[0.9rem] font-semibold text-ink-2">Different time for each side</summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Groom-side time" error={err('timeBySide.groom')}><Text type="time" value={ev.timeBySide?.groom ?? ''} onChange={(v) => sideTime('groom', v)} /></Field>
            <Field label="Bride-side time" error={err('timeBySide.bride')}><Text type="time" value={ev.timeBySide?.bride ?? ''} onChange={(v) => sideTime('bride', v)} /></Field>
          </div>
        </details>
      </Section>

      <Section title="Who & where">
        <Field label="Who is it for?" error={err('side')}><Choice label="Who is it for" value={ev.side} options={SIDES.map((s) => ({ v: s, label: sideName[s] }))} onChange={(v) => set('side', v)} /></Field>
        <Check label="Family only" hint="Hidden unless a guest ticks “show family events”." checked={ev.audience === 'family'} onChange={(v) => set('audience', v ? 'family' : 'all')} />
        <Field label="City" error={err('city')}><Choice label="City" value={ev.city} options={CITIES.map((c) => ({ v: c, label: c === 'TBD' ? 'Not decided' : c }))} onChange={(v) => set('city', v)} /></Field>
        <Field label="Venue" error={err('venueName')}>
          <Text value={ev.venueName ?? ''} onChange={(v) => set('venueName', v || null)} placeholder="Venue to be announced" />
          {ev.venueName !== hotel && <button type="button" onClick={() => set('venueName', hotel)} className="mt-1.5 text-[0.85rem] font-semibold text-oxblood underline underline-offset-2">Use the hotel: {hotel}</button>}
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <L10nInput label="Spot inside the venue (e.g. Lawn)" value={ev.area} onChange={(v) => set('area', v)} error={err('area')} />
          <L10nInput label="Room or floor (e.g. 2nd Floor)" value={ev.room} onChange={(v) => set('room', v)} error={err('room')} />
        </div>
        <Field label="Map link" error={err('mapLink')} hint="In Google Maps: open the place → Share → Copy link.">
          <Text inputMode="url" autoCapitalize="none" placeholder="https://maps.app.goo.gl/…" value={ev.mapLink ?? ''} onChange={(v) => set('mapLink', v.trim() || undefined)} />
          {ev.mapLink && <a href={ev.mapLink} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block text-[0.85rem] font-semibold text-oxblood underline underline-offset-2">Test the link ↗</a>}
        </Field>
      </Section>

      <Section title="Details for guests">
        <L10nInput label="Notes" multiline value={ev.notes} onChange={(v) => set('notes', v)} error={err('notes')} />
        <L10nInput label="Getting there / transport" multiline value={ev.transport} onChange={(v) => set('transport', v)} error={err('transport')} />
        <div className="rounded-xl border border-line bg-paper p-3">
          <Check label="Has a dress code" checked={!!dc} onChange={(v) => set('dressCode', v ? { en: 'Any', swatch: 'any' } : undefined)} />
          {dc && (
            <div className="mt-2 space-y-3">
              <L10nInput label="Dress code" required value={{ en: dc.en, hi: dc.hi }} onChange={(v) => set('dressCode', { ...dc, en: v?.en ?? '', hi: v?.hi })} error={err('dressCode')} />
              <Field label="Colour theme" error={err('dressCode.swatch')}><Select value={dc.swatch} options={SWATCHES.map((s) => ({ v: s, label: SWATCH_LABEL[s] ?? s }))} onChange={(v) => set('dressCode', { ...dc, swatch: v })} /></Field>
            </div>
          )}
        </div>
      </Section>

      <details className="rounded-2xl border border-line px-3.5 py-2">
        <summary className="min-h-9 cursor-pointer text-[0.9rem] font-semibold text-ink-2">More settings</summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kind" hint="Meals appear in the compact meal strip." error={err('type')}><Select value={ev.type} options={TYPES.map((t) => ({ v: t, label: t[0].toUpperCase() + t.slice(1) }))} onChange={(v) => set('type', v)} /></Field>
            <Field label="Icon"><Select value={ev.icon ?? ''} options={[{ v: '', label: 'Automatic' }, ...ICONS.map((i) => ({ v: i, label: i }))]} onChange={(v) => set('icon', v || undefined)} /></Field>
            <Field label="Length (minutes)" hint="Used for the calendar and “now / next”." error={err('durationMin')}>
              <Text inputMode="numeric" value={ev.durationMin !== undefined ? String(ev.durationMin) : ''} onChange={(v) => set('durationMin', v === '' ? undefined : Number(v.replace(/\D/g, '')))} />
            </Field>
            <Field label="Internal id (fixed)"><Text value={ev.id} readOnly aria-readonly="true" onChange={() => {}} /></Field>
          </div>
          <Check label="Hindi still needs proofreading" checked={!!ev.hiDraft} onChange={(v) => set('hiDraft', v || undefined)} />
        </div>
      </details>

      <div className="flex flex-wrap gap-2 pt-1">
        <Btn small kind="primary" onClick={onClose}>Done</Btn>
        <Btn small onClick={onDuplicate}>Duplicate</Btn>
        {sure
          ? <><Btn small kind="danger" onClick={onDelete}>Yes, delete this event</Btn><Btn small onClick={() => setSure(false)}>Keep</Btn></>
          : <Btn small kind="danger" onClick={() => setSure(true)}>Delete…</Btn>}
      </div>
    </div>
  );
}
