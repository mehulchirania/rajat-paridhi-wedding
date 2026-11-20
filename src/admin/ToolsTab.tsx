import { useMemo, useState } from 'react';
import type { Content } from '../lib/data';
import type { EventItem } from '../types';
import { Btn, Card, Check, Field, Select, Text, dateLabel, time12 } from './ui';

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const shift = (t: string, by: number): string | null => { const m = toMin(t) + by; return m < 0 || m > 1439 ? null : fromMin(m); };

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; onDone: (msg: string) => void }

/** "Everything from 2 PM onwards on 1 Dec is running 45 minutes late" in one step. */
export function ToolsTab({ draft, setDraft, onDone }: P) {
  const dates = useMemo(() => [...new Set(draft.events.map((e) => e.date))].sort(), [draft.events]);
  const [date, setDate] = useState(dates[0] ?? '');
  const [side, setSide] = useState<'all' | 'groom' | 'bride' | 'common'>('all');
  const [from, setFrom] = useState('00:00');
  const [by, setBy] = useState('30');
  const [flag, setFlag] = useState(true);
  const delta = Number.parseInt(by, 10) || 0;

  const rows = useMemo(() => draft.events
    .filter((e) => e.date === date && (side === 'all' || e.side === side) && e.time && e.time >= from)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
    .map((e) => ({ e, next: shift(e.time!, delta) })), [draft.events, date, side, from, delta]);
  const ok = rows.filter((r) => r.next);

  const apply = () => {
    const ids = new Map(ok.map((r) => [r.e.id, r.e]));
    setDraft((d) => ({
      ...d,
      events: d.events.map((e): EventItem => {
        if (!ids.has(e.id)) return e;
        const tbs = e.timeBySide && Object.fromEntries(Object.entries(e.timeBySide).map(([k, v]) => [k, shift(v as string, delta) ?? v]));
        return { ...e, time: shift(e.time!, delta), ...(tbs ? { timeBySide: tbs } : {}), ...(flag ? { needsConfirmation: true } : {}) };
      }),
    }));
    onDone(`Shifted ${ok.length} event${ok.length === 1 ? '' : 's'} by ${delta > 0 ? '+' : ''}${delta} min. Review, then publish.`);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[1.5rem]">Running late? Shift timings</h2>
      <p className="text-[0.92rem] text-ink-2">Moves every matching event on one day by the same number of minutes (including any per-side time). Nothing goes live until you publish.</p>
      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day"><Select value={date} options={dates.map((d) => ({ v: d, label: dateLabel(d) }))} onChange={setDate} /></Field>
          <Field label="Side"><Select value={side} options={['all', 'groom', 'bride', 'common']} onChange={setSide} /></Field>
          <Field label="Events starting at or after"><Text type="time" value={from} onChange={(v) => setFrom(v || '00:00')} /></Field>
          <Field label="Minutes (− = earlier)"><Text inputMode="numeric" value={by} onChange={(v) => setBy(v.replace(/[^\d-]/g, ''))} /></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {[-30, 15, 30, 60, 120].map((n) => <Btn key={n} small onClick={() => setBy(String(n))}>{n > 0 ? `+${n}` : n}</Btn>)}
        </div>
        <Check label="Also show “Timing being confirmed” on these events" checked={flag} onChange={setFlag} />
      </Card>
      <Card>
        <p className="mb-2 text-[0.82rem] font-semibold text-ink-2">Preview ({ok.length} will change)</p>
        <ul className="divide-y divide-line">
          {rows.map(({ e, next }) => (
            <li key={e.id} className="flex items-baseline justify-between gap-3 py-2 text-[0.95rem]">
              <span className="min-w-0 truncate">{e.title.en} <span className="text-ink-2">· {e.side}</span></span>
              <span className="shrink-0 tnum">{time12(e.time)} → {next ? <b>{time12(next)}</b> : <span className="text-bride-ink">out of range, skipped</span>}</span>
            </li>
          ))}
          {rows.length === 0 && <li className="py-3 text-ink-2">No events match.</li>}
        </ul>
        <Btn kind="primary" className="mt-3 w-full" disabled={!ok.length || !delta} onClick={apply}>Apply to {ok.length} event{ok.length === 1 ? '' : 's'}</Btn>
      </Card>
    </div>
  );
}
