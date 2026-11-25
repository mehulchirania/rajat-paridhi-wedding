import type { EventItem, GuestSide } from '../types';
import { useEffect, useRef, type ReactNode, type TouchEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../lib/app';
import { dayBySlug, days, eventById, events, meta, resolveTime, sortEvents, sideVisible, visibleEvents } from '../lib/data';
import { keep } from '../lib/nav';
import { EventCard } from '../components/EventCard';
import { EventSheet } from '../components/EventSheet';
import { MealStrip } from '../components/MealStrip';
import { NowNext, useNowState } from '../components/NowNext';
import { markWeddingDayShowerDone, useWeddingDayShower } from '../lib/weddingDay';
import { Petals } from '../components/Petals';
import { DayHero, OutfitStrip } from '../components/DayHero';
import { Icon } from '../components/Icons';
import { NotFound } from './NotFound';
import { store } from '../lib/storage';
import { useState } from 'react';

function Announcement() {
  const { t, l } = useApp();
  // The retired 'welcome' notice may still sit in previously published content; never show it.
  const a = meta.announcements.find((x) => x.active && x.id !== 'welcome');
  const [gone, setGone] = useState(() => !a || store.get(`dismiss-${a.id}`) === '1');
  if (!a || gone) return null;
  return (
    <div role="status" className="mt-4 flex items-start gap-2 border-l-2 border-champagne pl-3">
      <p className="flex-1 py-1 text-[0.9rem] font-medium leading-snug text-champagne-ink">{l(a.text)}</p>
      <button type="button" aria-label={t('announce.dismiss')} onClick={() => { store.set(`dismiss-${a.id}`, '1'); setGone(true); }} className="tap -my-1.5 inline-flex items-center justify-center text-champagne-ink"><Icon name="x" size={18} /></button>
    </div>
  );
}

/** Common hotel meals go in the compact strip; side-specific meals (e.g. lunch at home) are normal agenda rows. */
const isStripMeal = (e: EventItem) => e.type === 'meal' && e.side === 'common';

/** In "both" view, a groom event and a bride event at exactly the same time share one row (side by side, groom on the left).
 *  Everything else stays one event per row, in time order. */
function groupRows(list: EventItem[], view: GuestSide): EventItem[][] {
  const rows: EventItem[][] = [];
  const used = new Set<string>();
  for (const e of list) {
    if (used.has(e.id)) continue;
    used.add(e.id);
    const t = resolveTime(e, view);
    const mate = view === 'both' && t && (e.side === 'groom' || e.side === 'bride')
      ? list.find((x) => !used.has(x.id) && resolveTime(x, view) === t && (x.side === 'groom' || x.side === 'bride') && x.side !== e.side)
      : undefined;
    if (mate) { used.add(mate.id); rows.push(e.side === 'groom' ? [e, mate] : [mate, e]); } else rows.push([e]);
  }
  return rows;
}

/** Agenda wrapper + the 2px gradient thread, which draws itself top->bottom as the list scrolls into view.
 *  Cheap: one passive scroll listener, rAF-throttled, writing a single transform (scaleY, origin top) on one element.
 *  Progress only ever grows (never un-draws). What is already on screen at load is drawn by the CSS 600ms transition. */
function AgendaThread({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const w = wrap.current, th = thread.current;
    if (!w || !th) return;
    let max = 0, raf = 0, first = true;
    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / Math.max(1, r.height)));
      if (p <= max && !first) return;
      max = Math.max(max, p);
      th.style.transform = `scaleY(${max})`;
      if (first) { first = false; requestAnimationFrame(() => th.setAttribute('data-live', '')); } // later updates track the scroll quickly
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    raf = requestAnimationFrame(update);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    return () => { window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={wrap} className="relative mt-2">
      <span ref={thread} aria-hidden="true" className="thread-draw grad-thread absolute left-[4.65rem] top-[1.9rem] bottom-0 z-0 w-[2px] opacity-40" style={{ maskImage: 'linear-gradient(to bottom,#000 80%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,#000 80%,transparent)' }} />
      {children}
    </div>
  );
}

export function DayPage() {
  const { slug } = useParams();
  const day = dayBySlug(slug);
  const { t, side, setSide, showFamily, setShowFamily, dateLabel } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const { current: nowCurrent } = useNowState();
  const [showShower, setShowShower] = useState(useWeddingDayShower());
  const idx = day ? days.findIndex((d) => d.date === day.date) : -1;
  // Slide direction for the day crossfade: compare with the last committed day index (0 = first load / unknown).
  const prevIdx = useRef(-1);
  const dir = prevIdx.current < 0 || idx < 0 || prevIdx.current === idx ? 0 : idx > prevIdx.current ? 1 : -1;
  useEffect(() => { if (idx >= 0) prevIdx.current = idx; }, [idx]);
  if (!day) return <NotFound />;
  const liveIds = new Set(nowCurrent.map((e) => e.id));

  const prev = days[idx - 1], next = days[idx + 1];
  const dayEvents = events.filter((e) => e.date === day.date);
  const filter = { view: side, showFamily };
  const shown = visibleEvents(dayEvents, filter);
  const main = sortEvents(shown.filter((e) => !isStripMeal(e)), side);
  const rows = groupRows(main, side);
  const meals = shown.filter(isStripMeal);
  const hiddenFamily = dayEvents.filter((e) => sideVisible(e.side, side) && e.audience === 'family' && !showFamily).length;
  const otherSideCount = side === 'both' ? 0 : dayEvents.filter((e) => !isStripMeal(e) && !sideVisible(e.side, side) && (showFamily || e.audience !== 'family')).length;

  const openEvent = (id: string) => nav(`?e=${id}${keep().replace('?', '&')}`, { state: { sheet: true } });
  const closeSheet = () => { if ((loc.state as { sheet?: boolean } | null)?.sheet) nav(-1); else nav(`${loc.pathname}${keep()}`, { replace: true }); };
  const sheetEv = eventById(sp.get('e'));

  const onStart = (e: TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onEnd = (e: TouchEvent) => {
    const s = touch.current; touch.current = null;
    if (!s || sheetEv) return;
    const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const target = dx < 0 ? next : prev;
    if (target) nav(`/day/${target.slug}${keep()}`);
  };

  return (
    <div onTouchStart={onStart} onTouchEnd={onEnd} key={day.slug} className="day-enter" style={{ '--dx': `${dir * 10}px`, '--dy': dir ? '0px' : '6px' } as React.CSSProperties}>
      {showShower && <Petals mode="shower" onDone={() => { markWeddingDayShowerDone(); setShowShower(false); }} />}
      <DayHero date={day.date} dayIndex={idx} events={main} />
      <OutfitStrip events={main} />
      <NowNext />
      <Announcement />

      {hiddenFamily > 0 && main.length > 0 && (
        <button type="button" onClick={() => setShowFamily(true)} className="tap mt-2 inline-flex items-center text-left text-[0.9rem] leading-snug text-ink-2 underline underline-offset-4 decoration-line">
          {t('day.hiddenShow', { n: hiddenFamily })}
        </button>
      )}

      {main.length > 0 ? (
        <AgendaThread>
          <ol aria-label={t('nav.itinerary')} className="relative">{rows.map(([e, ...peers], i) => <EventCard key={e.id} ev={e} peers={peers} view={side} onOpen={openEvent} index={i} live={[e, ...peers].some((x) => liveIds.has(x.id))} />)}</ol>
        </AgendaThread>
      ) : (
        <div className="px-2 py-14 text-center">
          <h2 className="font-display text-[1.9rem] leading-tight text-ink">{t('day.empty.title', { side: t(`side.${side}.of`) })}</h2>
          <p className="mx-auto mt-2 max-w-[28ch] text-ink-2">{t('day.empty.body')}</p>
          <div className="mt-3 flex flex-col items-center">
            {otherSideCount > 0 && <button type="button" onClick={() => setSide('both')} className="tap px-3 font-semibold text-oxblood underline underline-offset-4">{t('day.empty.showBoth')}</button>}
            {hiddenFamily > 0 && <button type="button" onClick={() => setShowFamily(true)} className="tap px-3 font-semibold text-oxblood underline underline-offset-4">{t('day.empty.showFamily')}</button>}
          </div>
        </div>
      )}

      <MealStrip meals={meals} view={side} onOpen={openEvent} />

      <nav aria-label={t('days.label')} className="mt-8 flex justify-between gap-3 border-t border-line pt-1">
        {prev ? <Link to={`/day/${prev.slug}${keep()}`} aria-label={t('day.prev')} className="tap inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-ink-2"><Icon name="left" size={16} />{dateLabel(prev.date, false)}</Link> : <span />}
        {next ? <Link to={`/day/${next.slug}${keep()}`} aria-label={t('day.next')} className="tap inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-ink-2">{dateLabel(next.date, false)}<Icon name="right" size={16} /></Link> : <span />}
      </nav>

      {sheetEv && sheetEv.date === day.date && <EventSheet ev={sheetEv} view={side} onClose={closeSheet} />}
    </div>
  );
}
