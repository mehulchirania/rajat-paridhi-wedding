import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../lib/app';
import { addDays, istToday, nowMs, endInstant } from '../lib/time';
import { durationOf, events, nikasi, resolveTime, sortEvents, startMs, visibleEvents } from '../lib/data';
import { Icon } from './Icons';
import { HelpSheet } from './HelpSheet';
import { contactsForView } from '../lib/contacts';
import { useLocation } from 'react-router-dom';
import { pageLabel } from './HelpFab';
import { TimeText, whereText } from './EventCard';
import type { EventItem } from '../types';

function useTick(ms = 30_000) {
  const [n, setN] = useState(nowMs());
  useEffect(() => { const i = setInterval(() => setN(nowMs()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}

export function Countdown() {
  const { t, side } = useApp();
  const now = useTick();
  if (!nikasi) return null;
  const st = startMs(nikasi, 'groom');
  if (st === null || st <= now) return null;
  const diff = st - now;
  const d = Math.floor(diff / 86_400_000), h = Math.floor(diff / 3_600_000) % 24, m = Math.floor(diff / 60_000) % 60;
  if (side === 'bride') return null; // Nikasi is the groom's procession; keep bride view uncluttered
  return (
    <section aria-label={t('countdown.title')} className="mb-4 rounded-2xl bg-maroon p-4 text-cream shadow-md">
      <p className="text-[0.85rem] font-semibold uppercase tracking-wider text-gold">{t('countdown.title')}</p>
      <p className="mt-1 flex items-end gap-4 font-display" role="timer">
        {([[d, 'd'], [h, 'h'], [m, 'm']] as const).map(([v, k]) => (
          <span key={k} className="text-center"><span className="block text-[2.4rem] font-bold leading-none">{v}</span><span className="text-[0.8rem] font-sans">{t(`countdown.${k}`)}</span></span>
        ))}
      </p>
    </section>
  );
}

const fmtDur = (min: number, t: (k: string, v?: Record<string, string | number>) => string) =>
  min >= 60 ? t('time.hr', { n: Math.round(min / 6) / 10 }) : t('time.min', { n: Math.max(1, min) });

export function NowNext() {
  const { t, l, side, showFamily, dateLabel } = useApp();
  const [help, setHelp] = useState(false);
  const loc = useLocation();
  const now = useTick();
  const { current, next, active } = useMemo(() => {
    const today = istToday(now);
    const pool = events.filter((e) => e.date === today || e.date === addDays(today, -1));
    const vis = sortEvents(visibleEvents(pool, { view: side, showFamily }), side).filter((e) => resolveTime(e, side));
    const cur: EventItem[] = [], nxt: EventItem[] = [];
    for (const e of vis) {
      const s = startMs(e, side)!;
      if (s <= now && now < endInstant(s, durationOf(e))) cur.push(e);
      else if (s > now && e.date === today) nxt.push(e);
    }
    return { current: cur.slice(0, 2), next: nxt[0], active: events.some((e) => e.date === today) || cur.length > 0 };
  }, [now, side, showFamily]);

  if (!active) return null;
  const canHelp = contactsForView(side).length > 0;
  const Row = ({ ev, label, tone }: { ev: EventItem; label: string; tone: string }) => {
    const s = startMs(ev, side)!;
    const mins = Math.round((s - now) / 60_000);
    return (
      <div className={`rounded-xl p-3 ${tone}`}>
        <p className="text-[0.8rem] font-bold uppercase tracking-wider">{label}{s > now ? ` · ${t('nownext.in', { t: fmtDur(mins, t) })}` : ''}</p>
        <p className="font-display text-[1.35rem] font-bold leading-tight">{l(ev.title)}</p>
        <p className="text-[0.92rem]"><TimeText ev={ev} view={side} /> · {whereText(ev, l, t('event.venueTbd'))}</p>
      </div>
    );
  };
  return (
    <section aria-label={t('nownext.now')} aria-live="polite" className="mb-4 space-y-2 rounded-2xl border-2 border-gold bg-paper p-3 shadow-md">
      {current.map((e) => <Row key={e.id} ev={e} label={t('nownext.now')} tone="bg-maroon text-cream" />)}
      {next && <Row ev={next} label={t('nownext.next')} tone="bg-cream text-ink" />}
      {!current.length && !next && <p className="p-2 font-display text-[1.2rem] text-maroon">{t('nownext.none')}</p>}
      {canHelp && (
        <button type="button" onClick={() => setHelp(true)} className="tap inline-flex items-center gap-2 rounded-full border-2 border-[#1F7A4D] px-4 font-bold text-[#1F7A4D]">
          <Icon name="chat" size={18} />{t('nownext.help')}
        </button>
      )}
      <HelpSheet open={help} onClose={() => setHelp(false)} page={pageLabel(loc.pathname, t, dateLabel)} />
    </section>
  );
}
