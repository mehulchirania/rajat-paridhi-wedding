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

const EYEBROW = 'text-[0.78rem] font-semibold uppercase tracking-[.14em] [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]';
const dotCls = (side: Side) => side === 'groom' ? 'bg-groom' : side === 'bride' ? 'bg-bride' : 'bg-gradient-to-br from-groom to-bride';

/** One agenda row. The vertical thread is drawn by the parent <ol> at x = 4.65rem (see DayPage). */
export function EventCard({ ev, view, onOpen }: { ev: EventItem; view: GuestSide; onOpen: (id: string) => void }) {
  const { t, l, lang } = useApp();
  const rt = resolveTime(ev, view);
  const parts = rt ? timeParts(rt, lang) : null;
  const tbd = ev.status === 'tbd';
  const sideWord = ev.side === 'common' ? t('side.common.short') : t(`side.${ev.side}.of`);
  const showDiffers = view === 'both' && !!ev.timeBySide;
  return (
    <li className="relative" style={{ animation: 'var(--animate-rise)' }}>
      <span aria-hidden="true" className="absolute right-0 top-0 h-px bg-line [li:first-child>&]:hidden" style={{ left: '5.65rem' }} />
      <span aria-hidden="true" className={`absolute left-[4.4rem] top-[1.65rem] z-10 h-[0.6rem] w-[0.6rem] rounded-full ring-[3px] ring-ivory ${dotCls(ev.side)}`} />
      <button type="button" onClick={() => onOpen(ev.id)} aria-label={t('card.open', { title: l(ev.title) })}
        className="grid w-full grid-cols-[4.35rem_1fr] pt-5 text-left transition-opacity active:opacity-70">
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
        <div className={`min-w-0 pl-[1.3rem] ${ev.mapLink ? 'pb-3' : 'pb-5'}`}>
          <p className={`${EYEBROW} leading-snug `}>
            <span className={sideInk(ev.side)}>{sideWord}</span>
            {ev.city !== 'TBD' && <span className="text-ink-2"> · {t(`city.${ev.city}`)}</span>}
            {ev.audience === 'family' && <span className="text-ink-2"> · {t('event.familyOnly')}</span>}
          </p>
          <div className="mt-1.5 flex items-start gap-3">
            <EventBadge ev={ev} size={40} />
            <div className="min-w-0">
              <h3 className={`font-display text-[1.6rem] leading-[1.1] ${tbd ? 'italic text-ink-2' : 'text-ink'}`}>{l(ev.title)}</h3>
              {glossOf(ev, lang) && <p className="mt-0.5 text-[0.9rem] leading-snug text-ink-2">{glossOf(ev, lang)}</p>}
            </div>
          </div>
          <p className="mt-1.5 text-[0.9rem] leading-snug text-ink-2">{whereText(ev, l, t('event.venueTbd'))}</p>
          {ev.dressCode && (
            <p className="mt-2 flex items-center gap-2 text-[0.9rem] leading-snug text-ink">
              <Swatch kind={ev.dressCode.swatch} />
              <span>{t('row.dress', { d: l(ev.dressCode) })}</span>
            </p>
          )}
          {ev.notes && <p className="mt-1.5 text-[0.9rem] leading-snug text-ink-2">{l(ev.notes)}</p>}
          {(ev.needsConfirmation || tbd) && <p className="mt-2"><ConfirmBadge /></p>}
          {showDiffers && <p className="mt-1.5"><DiffersBadge ev={ev} /></p>}
        </div>
      </button>
      {ev.mapLink && (
        <div className="pb-5 pl-[5.65rem]">
          <a href={ev.mapLink} target="_blank" rel="noopener noreferrer" aria-label={`${t('sheet.maps')}: ${ev.venueName ?? l(ev.title)}`}
            className="tap inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory px-4 text-[0.88rem] font-semibold text-oxblood transition-colors active:bg-sand">
            <Icon name="pin" size={16} />{t('sheet.maps')}
          </a>
        </div>
      )}
    </li>
  );
}
