import { useMemo, useState } from 'react';
import type { Issue } from '../../shared/validate';
import { CITIES, SIDES, SWATCHES, TYPES } from '../../shared/validate';
import type { Content } from '../lib/data';
import type { EventItem } from '../types';
import { Btn, Card, Check, Field, L10nInput, Select, Text, clean, dateLabel, slug, time12 } from './ui';

const ICONS = ['kumkum', 'mehendi', 'pooja', 'rakhi', 'carnival', 'mayra', 'ring', 'music', 'nikasi', 'travel', 'meet', 'garland', 'phere', 'reception', 'meal', 'tea', 'info'];
const sideCls = { groom: 'bg-groom-soft text-groom-ink', bride: 'bg-bride-soft text-bride-ink', common: 'bg-sand text-ink-2' };

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }

export function EventsTab({ draft, setDraft, issues }: P) {
  const [day, setDay] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  const dates = useMemo(() => [...new Set(draft.events.map((e) => e.date))].sort(), [draft.events]);
  const list = useMemo(
    () => draft.events.filter((e) => day === 'all' || e.date === day).sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '99').localeCompare(b.time ?? '99') || a.id.localeCompare(b.id)),
    [draft.events, day],
  );

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
    setOpen(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {['all', ...dates].map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={day === d}
            className={`min-h-10 rounded-full border px-4 text-[0.9rem] font-semibold ${day === d ? 'border-oxblood bg-oxblood text-white' : 'border-line bg-white text-ink'}`}>
            {d === 'all' ? 'All days' : dateLabel(d)}
          </button>
        ))}
        <Btn kind="primary" small className="ml-auto" onClick={() => add()}>+ Add event</Btn>
      </div>

      {list.map((e) => {
        const mine = issues.filter((i) => i.path.startsWith(`events.${e.id}.`));
        const isOpen = open === e.id;
        return (
          <Card key={e.id} className={mine.length ? 'border-bride' : ''}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : e.id)} className="flex min-h-12 w-full items-start gap-3 text-left">
              <span className="w-[4.6rem] shrink-0 pt-0.5 text-[0.95rem] font-semibold tnum text-ink">{time12(e.time)}{e.openEnded ? '+' : ''}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[1.25rem] leading-tight text-ink">{e.title.en || '(untitled)'}</span>
                <span className="mt-0.5 block truncate text-[0.85rem] text-ink-2">{dateLabel(e.date)} · {e.venueName || 'Venue TBA'} · {e.city}</span>
                <span className="mt-1.5 flex flex-wrap gap-1.5 text-[0.75rem] font-semibold">
                  <span className={`rounded-full px-2 py-0.5 ${sideCls[e.side]}`}>{e.side}</span>
                  {e.needsConfirmation && <span className="rounded-full bg-amber-soft px-2 py-0.5 text-amber-ink">timing being confirmed</span>}
                  {e.audience === 'family' && <span className="rounded-full bg-sand px-2 py-0.5 text-ink-2">family only</span>}
                  {e.status === 'tbd' && <span className="rounded-full bg-sand px-2 py-0.5 text-ink-2">TBD</span>}
                  {mine.length > 0 && <span className="rounded-full bg-bride-soft px-2 py-0.5 text-bride-ink">{mine.length} to fix</span>}
                </span>
              </span>
              <span aria-hidden="true" className="pt-1 text-ink-2">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && <EventForm ev={e} issues={mine} update={(f) => update(e.id, f)} onDuplicate={() => add(e)} onDelete={() => remove(e.id)} meta={draft.meta.hotel.name} />}
          </Card>
        );
      })}
      {list.length === 0 && <p className="py-8 text-center text-ink-2">No events{day !== 'all' ? ' on this day' : ''}.</p>}
    </div>
  );
}

function EventForm({ ev, issues, update, onDuplicate, onDelete, meta }: { ev: EventItem; issues: Issue[]; update: (f: (e: EventItem) => EventItem) => void; onDuplicate: () => void; onDelete: () => void; meta: string }) {
  const [sure, setSure] = useState(false);
  const err = (f: string) => issues.find((i) => i.path === `events.${ev.id}.${f}` || i.path.startsWith(`events.${ev.id}.${f}.`))?.msg;
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K] | undefined) => update((e) => ({ ...e, [k]: v }));
  const timeOrNull = (v: string) => (v ? v : null);
  const dc = ev.dressCode;
  return (
    <div className="mt-4 space-y-4 border-t border-line pt-4">
      <L10nInput label="Title" required value={ev.title} onChange={(v) => set('title', v ?? { en: '' })} error={err('title')} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={err('date')}><Text type="date" value={ev.date} onChange={(v) => set('date', v)} /></Field>
        <Field label="Time" error={err('time')} hint="Leave empty only if timing is TBD."><Text type="time" value={ev.time ?? ''} onChange={(v) => set('time', timeOrNull(v))} /></Field>
        <Field label="Groom-side time" hint="Only if different." error={err('timeBySide.groom')}>
          <Text type="time" value={ev.timeBySide?.groom ?? ''} onChange={(v) => update((e) => ({ ...e, timeBySide: v || e.timeBySide?.bride ? { ...(v ? { groom: v } : {}), ...(e.timeBySide?.bride ? { bride: e.timeBySide.bride } : {}) } : undefined }))} />
        </Field>
        <Field label="Bride-side time" hint="Only if different." error={err('timeBySide.bride')}>
          <Text type="time" value={ev.timeBySide?.bride ?? ''} onChange={(v) => update((e) => ({ ...e, timeBySide: v || e.timeBySide?.groom ? { ...(e.timeBySide?.groom ? { groom: e.timeBySide.groom } : {}), ...(v ? { bride: v } : {}) } : undefined }))} />
        </Field>
      </div>

      <div>
        <Check label="Show “Timing being confirmed”" checked={ev.needsConfirmation} onChange={(v) => set('needsConfirmation', v)} />
        <Check label="Open-ended (“12:00 onwards”)" checked={!!ev.openEnded} onChange={(v) => set('openEnded', v || undefined)} />
        <Check label="Timing is TBD (no time yet)" checked={ev.status === 'tbd'} onChange={(v) => set('status', v ? 'tbd' : 'confirmed')} />
        <Check label="Family-only (hidden unless guest ticks “show family events”)" checked={ev.audience === 'family'} onChange={(v) => set('audience', v ? 'family' : 'all')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Side" error={err('side')}><Select value={ev.side} options={SIDES} onChange={(v) => set('side', v)} /></Field>
        <Field label="City" error={err('city')}><Select value={ev.city} options={CITIES} onChange={(v) => set('city', v)} /></Field>
        <Field label="Type" hint="Meals appear in the compact meal strip." error={err('type')}><Select value={ev.type} options={TYPES} onChange={(v) => set('type', v)} /></Field>
        <Field label="Icon"><Select value={ev.icon ?? ''} options={['', ...ICONS]} onChange={(v) => set('icon', v || undefined)} /></Field>
      </div>

      <Field label="Venue" error={err('venueName')} hint={`The hotel is “${meta}”.`}><Text value={ev.venueName ?? ''} onChange={(v) => set('venueName', v || null)} placeholder="Venue to be announced" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <L10nInput label="Area (e.g. Lawn)" value={ev.area} onChange={(v) => set('area', v)} error={err('area')} />
        <L10nInput label="Room (e.g. 2nd Floor)" value={ev.room} onChange={(v) => set('room', v)} error={err('room')} />
      </div>
      <Field label="Google Maps link" error={err('mapLink')} hint="Open the place in Google Maps → Share → Copy link."><Text inputMode="url" autoCapitalize="none" placeholder="https://maps.app.goo.gl/…" value={ev.mapLink ?? ''} onChange={(v) => set('mapLink', v.trim() || undefined)} /></Field>

      <L10nInput label="Notes" multiline value={ev.notes} onChange={(v) => set('notes', v)} error={err('notes')} />
      <L10nInput label="Getting there / transport" multiline value={ev.transport} onChange={(v) => set('transport', v)} error={err('transport')} />

      <div className="rounded-xl bg-sand p-3">
        <Check label="Has a dress code" checked={!!dc} onChange={(v) => set('dressCode', v ? { en: 'Any', swatch: 'any' } : undefined)} />
        {dc && (
          <div className="mt-2 space-y-3">
            <L10nInput label="Dress code" required value={{ en: dc.en, hi: dc.hi }} onChange={(v) => set('dressCode', { ...dc, en: v?.en ?? '', hi: v?.hi })} error={err('dressCode')} />
            <Field label="Colour swatch" error={err('dressCode.swatch')}><Select value={dc.swatch} options={SWATCHES} onChange={(v) => set('dressCode', { ...dc, swatch: v })} /></Field>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Length (minutes)" hint="For the calendar and “now/next”." error={err('durationMin')}>
          <Text inputMode="numeric" value={ev.durationMin !== undefined ? String(ev.durationMin) : ''} onChange={(v) => set('durationMin', v === '' ? undefined : Number(v.replace(/\D/g, '')))} />
        </Field>
        <Field label="Id (can’t change)"><Text value={ev.id} readOnly aria-readonly="true" onChange={() => {}} /></Field>
      </div>
      <Check label="Hindi still needs proofreading" checked={!!ev.hiDraft} onChange={(v) => set('hiDraft', v || undefined)} />

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Btn small onClick={onDuplicate}>Duplicate</Btn>
        {sure
          ? <><Btn small kind="danger" onClick={onDelete}>Yes, delete this event</Btn><Btn small onClick={() => setSure(false)}>Keep</Btn></>
          : <Btn small kind="danger" onClick={() => setSure(true)}>Delete…</Btn>}
      </div>
    </div>
  );
}
