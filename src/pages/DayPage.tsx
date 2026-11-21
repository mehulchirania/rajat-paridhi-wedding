import type { EventItem } from '../types';
import { useRef, type TouchEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../lib/app';
import { dayBySlug, days, eventById, events, meta, sortEvents, sideVisible, visibleEvents } from '../lib/data';
import { keep } from '../lib/nav';
import { EventCard } from '../components/EventCard';
import { EventSheet } from '../components/EventSheet';
import { MealStrip } from '../components/MealStrip';
import { NowNext } from '../components/NowNext';
import { DayHero, OutfitStrip } from '../components/DayHero';
import { Icon } from '../components/Icons';
import { NotFound } from './NotFound';
import { store } from '../lib/storage';
import { useState } from 'react';

function Announcement() {
  const { t, l } = useApp();
  const a = meta.announcements.find((x) => x.active);
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

export function DayPage() {
  const { slug } = useParams();
  const day = dayBySlug(slug);
  const { t, side, setSide, showFamily, setShowFamily, dateLabel } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const touch = useRef<{ x: number; y: number } | null>(null);
  if (!day) return <NotFound />;

  const idx = days.findIndex((d) => d.date === day.date);
  const prev = days[idx - 1], next = days[idx + 1];
  const dayEvents = events.filter((e) => e.date === day.date);
  const filter = { view: side, showFamily };
  const shown = visibleEvents(dayEvents, filter);
  const main = sortEvents(shown.filter((e) => !isStripMeal(e)), side);
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
    <div onTouchStart={onStart} onTouchEnd={onEnd} key={day.slug} style={{ animation: 'var(--animate-rise)' }}>
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
        <div className="relative mt-2">
          <span aria-hidden="true" className="grad-thread absolute left-[4.65rem] top-[1.9rem] bottom-0 z-0 w-[2px] opacity-40" style={{ maskImage: 'linear-gradient(to bottom,#000 80%,transparent)', WebkitMaskImage: 'linear-gradient(to bottom,#000 80%,transparent)' }} />
          <ol aria-label={t('nav.itinerary')} className="relative">{main.map((e) => <EventCard key={e.id} ev={e} view={side} onOpen={openEvent} />)}</ol>
        </div>
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
