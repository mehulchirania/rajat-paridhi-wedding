import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/app';
import { events, meta, resolveTime, startMs, visibleEvents } from '../lib/data';
import { keep } from '../lib/nav';
import { prefersReducedMotion } from '../lib/motion';
import { store } from '../lib/storage';
import { dateToSlug } from '../lib/time';
import type { EventItem, L10n } from '../types';
import { TimeText } from './EventCard';
import { Icon } from './Icons';
import { useNowState } from './NowNext';

type Slide = { key: string; kind: 'now' | 'next'; ev: EventItem } | { key: string; kind: 'notice'; id: string; text: L10n };

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;
const label = 'shrink-0 text-[0.78rem] font-semibold uppercase tracking-[.14em] text-champagne-light [html[lang=hi]_&]:text-[0.85rem] [html[lang=hi]_&]:tracking-normal';

/** Slim carousel under the header on every page: the live event (when one is on) followed by every active admin notice.
 *  Rotates by itself, pauses while touched, hovered or focused, swipes and has dots; no autoplay under reduced motion. */
export function UpdatesBanner() {
  const { t, l, side, showFamily, dateLabel } = useApp();
  const { current, now } = useNowState();
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set(meta.announcements.filter((a) => store.get(`dismiss-${a.id}`) === '1').map((a) => a.id)));
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');
  const [reduced] = useState(prefersReducedMotion);
  const start = useRef<{ x: number; id: number } | null>(null);
  const swiped = useRef(false);

  // The retired 'welcome' notice may still sit in previously published content; never show it.
  const notices = meta.announcements.filter((a) => a.active && a.id !== 'welcome' && !dismissed.has(a.id));
  const ev = current[0];
  // Nothing live? Keep the banner useful with the next event on the whole programme, so it is never an empty bar.
  const upcoming = useMemo(() => visibleEvents(events, { view: side, showFamily })
    .filter((e) => resolveTime(e, side) && startMs(e, side)! > now)
    .sort((a, b) => startMs(a, side)! - startMs(b, side)!)[0], [side, showFamily, now]);
  const slides: Slide[] = [
    ...(ev ? [{ key: `now-${ev.id}`, kind: 'now' as const, ev }] : upcoming ? [{ key: `next-${upcoming.id}`, kind: 'next' as const, ev: upcoming }] : []),
    ...notices.map((a) => ({ key: `n-${a.id}`, kind: 'notice' as const, id: a.id, text: a.text })),
  ];
  const n = slides.length;
  const i = n ? Math.min(idx, n - 1) : 0;
  const auto = n > 1 && !reduced && !paused && visible;

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setIdx((i + 1) % n), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [auto, i, n]);

  if (!n) return null;
  const slide = slides[i];
  const go = (to: number) => setIdx(((to % n) + n) % n);
  const dismiss = (id: string) => { store.set(`dismiss-${id}`, '1'); setDismissed((s) => new Set(s).add(id)); };

  const onDown = (e: ReactPointerEvent) => { swiped.current = false; start.current = { x: e.clientX, id: e.pointerId }; if (e.pointerType !== 'mouse') setPaused(true); };
  const onUp = (e: ReactPointerEvent) => {
    const s = start.current; start.current = null;
    if (e.pointerType !== 'mouse') setPaused(false);
    if (!s || n < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > SWIPE_PX) { swiped.current = true; go(i + (dx < 0 ? 1 : -1)); }
  };

  return (
    <section role="region" aria-roledescription="carousel" aria-label={t('banner.label')}
      className="bg-oxblood text-on-wine"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPaused(false); }}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex min-h-11 items-center gap-1 pl-4 pr-2">
        <div key={slide.key} className="banner-slide flex min-w-0 flex-1 touch-pan-y items-center py-1.5"
          role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}`} aria-live={auto ? 'off' : 'polite'}
          onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { start.current = null; setPaused(false); }}
          onClickCapture={(e) => { if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; } }}>
          {slide.kind !== 'notice' ? (
            <Link to={`/day/${dateToSlug(slide.ev.date)}?e=${slide.ev.id}${keep().replace('?', '&')}`} state={{ sheet: true }} draggable={false}
              className="flex min-w-0 flex-1 items-center gap-2 transition-opacity active:opacity-80">
              {slide.kind === 'now' && <span aria-hidden="true" className="flame-dot inline-block h-2 w-2 shrink-0 rounded-full" />}
              <span className={label}>{t(slide.kind === 'now' ? 'nownext.nowShort' : 'nownext.next')}</span>
              <span className="min-w-0 flex-1 truncate text-[0.95rem] font-semibold">{l(slide.ev.title)}<span className="font-normal text-on-wine/80"> · {slide.kind === 'next' && <>{dateLabel(slide.ev.date, false)}, </>}<TimeText ev={slide.ev} view={side} /></span></span>
              <Icon name="right" size={16} className="shrink-0" />
            </Link>
          ) : (
            <p className="flex min-w-0 flex-1 items-center gap-2">
              <span className={label}>{t('banner.update')}</span>
              <span className="line-clamp-2 min-w-0 flex-1 text-[0.95rem] font-semibold leading-snug">{l(slide.text)}</span>
            </p>
          )}
        </div>
        {slide.kind === 'notice' && (
          <button type="button" aria-label={t('announce.dismiss')} onClick={() => dismiss(slide.id)}
            className="tap inline-flex shrink-0 items-center justify-center text-on-wine/80"><Icon name="x" size={18} /></button>
        )}
        {n > 1 && (
          <div className="flex shrink-0 items-center">
            {slides.map((s, k) => (
              <button key={s.key} type="button" aria-label={t('banner.goto', { n: k + 1 })} aria-current={k === i ? 'true' : undefined} onClick={() => go(k)}
                className="grid h-6 w-6 place-items-center">
                <span aria-hidden="true" className={`block h-1.5 rounded-full transition-all duration-200 ease-(--ease-out) ${k === i ? 'w-4 bg-ivory' : 'w-1.5 bg-ivory/40'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
