import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { EventItem, GuestSide, Lang, Side } from '../types';
import { useApp } from '../lib/app';
import { resolveTime } from '../lib/data';
import { ConfirmBadge, DiffersBadge, sideInk } from './Badges';
import { Swatch } from './Swatch';
import { Icon, EventBadge } from './Icons';
import { glossOf } from '../lib/gloss';

export function whereText(ev: EventItem, l: (x: any) => string, venueTbd: string): string {
  const parts = [ev.venueName, l(ev.area), l(ev.room)].filter(Boolean);
  return parts.length ? parts.join(' · ') : venueTbd;
}

export function TimeText({ ev, view }: { ev: EventItem; view: GuestSide }) {
  const { t, time } = useApp();
  const rt = resolveTime(ev, view);
  if (!rt) return <>{t('event.timeTbd')}</>;
  return <>{time(rt)}{ev.openEnded ? ` ${t('event.onwards')}` : ''}</>;
}

/** Numeral + eyebrow word for the agenda gutter. English "10:00" / "AM"; Hindi "10:00" / "सुबह". */
export function timeParts(time: string, lang: Lang): { num: string; per: string } {
  const [h, m] = time.split(':').map(Number);
  const num = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
  if (lang === 'hi') return { num, per: h < 4 ? 'रात' : h < 12 ? 'सुबह' : h < 16 ? 'दोपहर' : h < 19 ? 'शाम' : 'रात' };
  return { num, per: h < 12 ? 'AM' : 'PM' };
}

/** Labelled fact (Where / Dress code) with a round icon tile, so each kind of detail is easy to spot at a glance. */
function Detail({ label, icon, children, compact = false }: { label: string; icon: ReactNode; children: ReactNode; compact?: boolean }) {
  return (
    <div className={`flex items-start ${compact ? 'flex-col gap-1' : 'gap-2.5'}`}>
      <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ivory text-oxblood ring-1 ring-line">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[0.7rem] font-semibold uppercase leading-none tracking-[.12em] text-ink-2 [html[lang=hi]_&]:text-[0.78rem] [html[lang=hi]_&]:tracking-normal">{label}</dt>
        <dd className="mt-1 text-[0.95rem] leading-snug text-ink">{children}</dd>
      </div>
    </div>
  );
}

const EYEBROW ='text-[0.78rem] font-semibold uppercase tracking-[.14em] [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]';
const dotCls = (side: Side) => side === 'groom' ? 'bg-groom' : side === 'bride' ? 'bg-bride' : 'bg-gradient-to-br from-groom to-bride';

/** Marks the <li> data-reveal: "now" if already on screen at mount (content never hidden), else "hidden" until it
 *  scrolls into view (IntersectionObserver, once) and then "shown". Pure DOM attribute writes: no re-renders. */
function useReveal(index: number) {
  const ref = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const d = `${Math.min(index, 5) * 50}ms`;
    if (el.getBoundingClientRect().top < window.innerHeight || typeof IntersectionObserver === 'undefined') {
      el.style.setProperty('--d', d); el.dataset.reveal = 'now'; return;
    }
    el.dataset.reveal = 'hidden';
    const io = new IntersectionObserver((es) => {
      if (es.some((x) => x.isIntersecting)) { el.style.setProperty('--d', '60ms'); el.dataset.reveal = 'shown'; io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [index]);
  return ref;
}

/** The card content for one event. `compact` is the half-width variant used when two sides' events share a time slot. */
function EventBody({ ev, view, onOpen, compact }: { ev: EventItem; view: GuestSide; onOpen: (id: string) => void; compact: boolean }) {
  const { t, l, lang } = useApp();
  const tbd = ev.status === 'tbd';
  const sideWord = ev.side === 'common' ? t('side.common.short') : t(`side.${ev.side}.of`);
  const showDiffers = view === 'both' && !!ev.timeBySide;
  return (
    <div className="min-w-0">
      <button type="button" onClick={() => onOpen(ev.id)} aria-label={t('card.open', { title: l(ev.title) })}
        className={`row-body block w-full text-left transition-opacity active:opacity-70 ${compact ? 'pb-2' : ev.mapLink ? 'pb-3' : 'pb-5'}`}>
        <p className={`${EYEBROW} leading-snug `}>
          <span className={sideInk(ev.side)}>{sideWord}</span>
          {ev.city !== 'TBD' && <span className="text-ink-2"> · {t(`city.${ev.city}`)}</span>}
          {ev.audience === 'family' && <span className="text-ink-2"> · {t('event.familyOnly')}</span>}
        </p>
        <div className={compact ? 'mt-1.5' : 'mt-1.5 flex items-start gap-3'}>
          <EventBadge ev={ev} size={compact ? 34 : 40} />
          <div className={`min-w-0 ${compact ? 'mt-1.5' : ''}`}>
            <h3 className={`font-display leading-[1.1] ${compact ? 'text-[1.3rem]' : 'text-[1.6rem]'} ${tbd ? 'italic text-ink-2' : 'text-ink'}`}>{l(ev.title)}</h3>
            {glossOf(ev, lang) && <p className="mt-0.5 text-[0.9rem] leading-snug text-ink-2">{glossOf(ev, lang)}</p>}
          </div>
        </div>
        <dl className={`mt-3 rounded-xl bg-sand py-2.5 ${compact ? 'space-y-2 px-2' : 'space-y-2.5 px-3'}`}>
          <Detail compact={compact} label={t('sheet.where')} icon={<Icon name="pin" size={15} />}>{whereText(ev, l, t('event.venueTbd'))}</Detail>
          {ev.dressCode && <Detail compact={compact} label={t('event.dress')} icon={<Swatch kind={ev.dressCode.swatch} size={16} />}><span className="font-semibold">{l(ev.dressCode)}</span></Detail>}
        </dl>
        {ev.notes && <p className="mt-1.5 text-[0.9rem] leading-snug text-ink-2">{l(ev.notes)}</p>}
        {(ev.needsConfirmation || tbd) && <p className="mt-2"><ConfirmBadge /></p>}
        {showDiffers && <p className="mt-1.5"><DiffersBadge ev={ev} /></p>}
      </button>
      {ev.mapLink && (
        <div className={`row-body ${compact ? 'pb-4' : 'pb-5'}`}>
          <a href={ev.mapLink} target="_blank" rel="noopener noreferrer" aria-label={`${t('sheet.maps')}: ${ev.venueName ?? l(ev.title)}`}
            className="tap inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory px-4 text-[0.88rem] font-semibold text-oxblood transition-colors active:bg-sand">
            <Icon name="pin" size={16} />{t('sheet.maps')}
          </a>
        </div>
      )}
    </div>
  );
}

/** One agenda row. The vertical thread is drawn by the parent <ol> at x = 4.65rem (see DayPage).
 *  `peers` are events of the other side at the very same time: they share this row's time and sit side by side. */
export function EventCard({ ev, peers = [], view, onOpen, index = 0, live = false }: { ev: EventItem; peers?: EventItem[]; view: GuestSide; onOpen: (id: string) => void; index?: number; live?: boolean }) {
  const liRef = useReveal(index);
  const { t, lang } = useApp();
  const rt = resolveTime(ev, view);
  const parts = rt ? timeParts(rt, lang) : null;
  const group = [ev, ...peers];
  const split = peers.length > 0;
  return (
    <li ref={liRef} className="relative">
      <span aria-hidden="true" className="absolute right-0 top-0 h-px bg-line [li:first-child>&]:hidden" style={{ left: '5.65rem' }} />
      {live && <span aria-hidden="true" data-testid="diya-glow" className="diya-glow pointer-events-none absolute z-[5] h-[2.4rem] w-[2.4rem] rounded-full" style={{ left: 'calc(4.4rem + 0.3rem - 1.2rem)', top: 'calc(1.65rem + 0.3rem - 1.2rem)' }} />}
      <span aria-hidden="true" className={`row-dot absolute left-[4.4rem] top-[1.65rem] z-10 h-[0.6rem] w-[0.6rem] rounded-full ring-[3px] ring-ivory ${dotCls(split ? 'common' : ev.side)}`} />
      <div className="row-body grid w-full grid-cols-[4.35rem_1fr] pt-5">
        <div className="pr-3 text-right">
          {parts ? (
            <>
              <p className="font-display text-[1.45rem] leading-none text-ink" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{parts.num}</p>
              <p className={`mt-1 text-ink-2 ${EYEBROW}`}>{parts.per}</p>
              {ev.openEnded && <p className="text-[0.78rem] leading-tight text-ink-2">{t('event.onwards')}</p>}
            </>
          ) : (
            <p className="pt-1 text-[0.95rem] font-medium leading-tight text-ink-2">{t('time.tba')}</p>
          )}
        </div>
        <div className={`min-w-0 pl-[1.3rem] ${split ? 'grid grid-cols-2 gap-2.5' : ''}`}>
          {group.map((e) => <EventBody key={e.id} ev={e} view={view} onOpen={onOpen} compact={split} />)}
        </div>
      </div>
    </li>
  );
}
