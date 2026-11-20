import { useRef, type TouchEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../lib/app';
import { dayBySlug, days, eventById, events, meta, sortEvents, sideVisible, visibleEvents } from '../lib/data';
import { keep } from '../lib/nav';
import { EventCard } from '../components/EventCard';
import { EventSheet } from '../components/EventSheet';
import { MealStrip } from '../components/MealStrip';
import { Countdown, NowNext } from '../components/NowNext';
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
    <div role="status" className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-gold bg-amber-soft p-3 text-amber-ink">
      <p className="flex-1 text-[0.95rem] font-semibold">{l(a.text)}</p>
      <button type="button" aria-label={t('announce.dismiss')} onClick={() => { store.set(`dismiss-${a.id}`, '1'); setGone(true); }} className="tap -m-1 inline-flex items-center justify-center"><Icon name="x" size={20} /></button>
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
  if (!day) return <NotFound />;

  const idx = days.findIndex((d) => d.date === day.date);
  const prev = days[idx - 1], next = days[idx + 1];
  const dayEvents = events.filter((e) => e.date === day.date);
  const filter = { view: side, showFamily };
  const shown = visibleEvents(dayEvents, filter);
  const main = sortEvents(shown.filter((e) => e.type !== 'meal'), side);
  const meals = shown.filter((e) => e.type === 'meal');
  const hiddenFamily = dayEvents.filter((e) => sideVisible(e.side, side) && e.audience === 'family' && !showFamily).length;
  const otherSideCount = side === 'both' ? 0 : dayEvents.filter((e) => e.type !== 'meal' && !sideVisible(e.side, side) && (showFamily || e.audience !== 'family')).length;

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
      <Announcement />
      <Countdown />
      <NowNext />
      <div className="mb-3">
        <h2 className="font-display text-[1.7rem] font-bold text-maroon">{dateLabel(day.date)}</h2>
        <label className="tap inline-flex cursor-pointer items-center gap-2 text-[0.9rem] font-semibold text-maroon">
          <input type="checkbox" className="h-5 w-5 accent-[#6B1A2F]" checked={showFamily} onChange={(e) => setShowFamily(e.target.checked)} />
          {t('toggle.family')}
        </label>
      </div>
      {hiddenFamily > 0 && <p className="mb-3 text-[0.88rem] text-muted">{t('day.familyHidden', { n: hiddenFamily })}</p>}

      {main.length > 0 ? (
        <div className="relative">
          <span aria-hidden="true" className="grad-thread absolute left-[11px] top-6 bottom-6 w-[4px] rounded-full opacity-80" />
          <ol className="relative space-y-4">{main.map((e) => <EventCard key={e.id} ev={e} view={side} onOpen={openEvent} />)}</ol>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gold bg-paper p-5 text-center">
          <h3 className="font-display text-[1.45rem] font-bold text-maroon">{t('day.empty.title', { side: t(`side.${side}.of`) })}</h3>
          <p className="mt-1 text-muted">{t('day.empty.body')}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {otherSideCount > 0 && <button type="button" onClick={() => setSide('both')} className="tap rounded-xl border-2 border-maroon bg-maroon px-4 font-bold text-cream">{t('day.empty.showBoth')}</button>}
            {hiddenFamily > 0 && <button type="button" onClick={() => setShowFamily(true)} className="tap rounded-xl border-2 border-maroon px-4 font-bold text-maroon">{t('day.empty.showFamily')}</button>}
          </div>
        </div>
      )}

      <MealStrip meals={meals} view={side} onOpen={openEvent} />

      <div className="mt-6 flex justify-between gap-3">
        {prev ? <Link to={`/day/${prev.slug}${keep()}`} className="tap inline-flex items-center gap-1 rounded-xl border-2 border-gold/60 bg-paper px-3 font-bold text-maroon"><Icon name="left" size={18} />{dateLabel(prev.date, false)}</Link> : <span />}
        {next ? <Link to={`/day/${next.slug}${keep()}`} className="tap inline-flex items-center gap-1 rounded-xl border-2 border-gold/60 bg-paper px-3 font-bold text-maroon">{dateLabel(next.date, false)}<Icon name="right" size={18} /></Link> : <span />}
      </div>

      {sheetEv && sheetEv.date === day.date && <EventSheet ev={sheetEv} view={side} onClose={closeSheet} />}
    </div>
  );
}
