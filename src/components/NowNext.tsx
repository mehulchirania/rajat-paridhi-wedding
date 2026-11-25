import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../lib/app';
import { addDays, istToday, nowMs, endInstant } from '../lib/time';
import { durationOf, events, resolveTime, sortEvents, startMs, visibleEvents } from '../lib/data';
import { Icon } from './Icons';
import { HelpSheet } from './HelpSheet';
import { contactsForView } from '../lib/contacts';
import { useLocation } from 'react-router-dom';
import { pageLabel } from './HelpFab';
import { TimeText, whereText } from './EventCard';
import type { EventItem } from '../types';
import { Link } from 'react-router-dom';
import { dateToSlug } from '../lib/time';
import { keep } from '../lib/nav';

export function useTick(ms = 30_000) {
  const [n, setN] = useState(nowMs());
  useEffect(() => { const i = setInterval(() => setN(nowMs()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}

const fmtDur = (min: number, t: (k: string, v?: Record<string, string | number>) => string) =>
  min >= 60 ? t('time.hr', { n: Math.round(min / 6) / 10 }) : t('time.min', { n: Math.max(1, min) });

/** Shared "what's happening now" computation (IST; honours ?now=YYYY-MM-DDTHH:mm via nowMs). */
export function useNowState() {
  const { side, showFamily } = useApp();
  const now = useTick();
  const state = useMemo(() => {
    const today = istToday(now);
    const pool = events.filter((e) => e.date === today || e.date === addDays(today, -1));
    const vis = sortEvents(visibleEvents(pool, { view: side, showFamily }), side).filter((e) => resolveTime(e, side));
    const cur: EventItem[] = [], nxt: EventItem[] = [];
    for (const e of vis) {
      const s = startMs(e, side)!;
      if (s <= now && now < endInstant(s, durationOf(e))) cur.push(e);
      else if (s > now && e.date === today) nxt.push(e);
    }
    return { current: cur.slice(-1), next: nxt[0], active: events.some((e) => e.date === today) || cur.length > 0 };
  }, [now, side, showFamily]);
  return { ...state, now };
}

export function NowNext() {
  const { t, l, side, dateLabel } = useApp();
  const [help, setHelp] = useState(false);
  const loc = useLocation();
  const { current, next, active, now } = useNowState();

  if (!active) return null;
  const canHelp = contactsForView(side).length > 0;
  const EB = 'text-[0.78rem] font-semibold uppercase tracking-[.14em] text-[#E3C792] [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]';
  const Item = ({ ev }: { ev: EventItem }) => (
    <div className="mt-1.5 first:mt-0">
      <p className="font-display text-[1.4rem] leading-[1.1]">{l(ev.title)}</p>
      <p className="mt-1 text-[0.9rem] leading-snug text-ivory/85"><TimeText ev={ev} view={side} /> · {whereText(ev, l, t('event.venueTbd'))}</p>
    </div>
  );
  const mins = next ? Math.round((startMs(next, side)! - now) / 60_000) : 0;
  const both = current.length > 0 && !!next;
  return (
    <section aria-label={t('nownext.now')} aria-live="polite" className="mt-4 rounded-[20px] bg-oxblood px-5 py-4 text-ivory">
      {current.length > 0 || next ? (
        <div className={both ? 'grid grid-cols-2 gap-x-4 divide-x divide-ivory/20' : ''}>
          {current.length > 0 && (
            <div className="min-w-0">
              <p className={`${EB} mb-1.5`}><span aria-hidden="true" className="flame-dot mr-1.5 inline-block h-2 w-2 rounded-full align-middle" />{t('nownext.nowShort')}</p>
              {current.map((e) => <Item key={e.id} ev={e} />)}
            </div>
          )}
          {next && (
            <div className={`min-w-0 ${both ? 'pl-4' : ''}`}>
              <p className={`${EB} mb-1.5`}>{t('nownext.next')} <span className="font-medium normal-case tracking-normal">· {t('nownext.in', { t: fmtDur(mins, t) })}</span></p>
              <Item ev={next} />
            </div>
          )}
        </div>
      ) : (
        <p className="font-display text-[1.25rem] leading-snug">{t('nownext.none')}</p>
      )}
      {canHelp && (
        <button type="button" onClick={() => setHelp(true)} className="tap -mb-2 mt-1 inline-flex items-center text-[0.95rem] font-medium underline underline-offset-4 decoration-ivory/60">
          {t('nownext.help')}
        </button>
      )}
      <HelpSheet open={help} onClose={() => setHelp(false)} page={pageLabel(loc.pathname, t, dateLabel)} />
    </section>
  );
}

/** Slim strip under the header on every page while an event is on: tap to open it. Hidden when nothing is live. */
export function NowBanner() {
  const { t, l, side } = useApp();
  const { current } = useNowState();
  const ev = current[0];
  if (!ev) return null;
  return (
    <Link to={`/day/${dateToSlug(ev.date)}?e=${ev.id}${keep().replace('?', '&')}`} state={{ sheet: true }} aria-live="polite"
      className="flex items-center gap-2 bg-oxblood px-4 py-2 text-ivory transition-opacity active:opacity-80">
      <span aria-hidden="true" className="flame-dot inline-block h-2 w-2 shrink-0 rounded-full" />
      <span className="shrink-0 text-[0.78rem] font-semibold uppercase tracking-[.14em] text-[#E3C792] [html[lang=hi]_&]:text-[0.85rem] [html[lang=hi]_&]:tracking-normal">{t('nownext.nowShort')}</span>
      <span className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold">{l(ev.title)}<span className="font-normal text-ivory/80"> · <TimeText ev={ev} view={side} /></span></span>
      <Icon name="right" size={16} className="shrink-0" />
    </Link>
  );
}
