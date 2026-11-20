import type { EventItem, GuestSide } from '../types';
import { useApp } from '../lib/app';
import { resolveTime } from '../lib/data';
import { CityBadge, ConfirmBadge, DiffersBadge, SideBadge } from './Badges';
import { Icon, eventIconName } from './Icons';
import { Swatch } from './Swatch';

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

const nodeCls = (side: EventItem['side']) => side === 'groom' ? 'bg-groom' : side === 'bride' ? 'bg-bride' : 'bg-gradient-to-br from-groom to-bride';

export function EventCard({ ev, view, onOpen }: { ev: EventItem; view: GuestSide; onOpen: (id: string) => void }) {
  const { t, l } = useApp();
  const accent = ev.side === 'groom' ? 'border-l-groom' : ev.side === 'bride' ? 'border-l-bride' : 'border-l-gold';
  return (
    <li className="relative pl-9" style={{ animation: 'var(--animate-rise)' }}>
      <span aria-hidden="true" className={`absolute left-0 top-5 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-paper text-white shadow ${nodeCls(ev.side)}`}>
        <Icon name={eventIconName(ev)} size={15} />
      </span>
      <button type="button" onClick={() => onOpen(ev.id)} aria-label={t('card.open', { title: l(ev.title) })}
        className={`block w-full rounded-2xl border border-gold/50 border-l-[6px] ${accent} bg-paper p-4 text-left shadow-sm transition active:scale-[.99] ${ev.status === 'tbd' ? 'border-dashed' : ''}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <SideBadge side={ev.side} />
          <CityBadge city={ev.city} />
          {ev.audience === 'family' && <span className="inline-flex rounded-full border border-maroon/30 bg-cream px-2.5 py-0.5 text-[0.78rem] font-semibold text-maroon">{t('event.familyOnly')}</span>}
        </div>
        <p className="mt-2 font-display text-[1.05rem] font-bold text-gold-dark"><TimeText ev={ev} view={view} /></p>
        <h3 className="font-display text-[1.55rem] font-bold leading-tight text-maroon">{l(ev.title)}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-[0.95rem] text-ink"><Icon name="pin" size={18} className="mt-0.5 shrink-0 text-muted" />
          <span>{whereText(ev, l, t('event.venueTbd'))}</span></p>
        {ev.dressCode && (
          <p className="mt-2 flex items-center gap-2 text-[0.95rem]">
            <Swatch kind={ev.dressCode.swatch} />
            <span><span className="text-muted">{t('event.dress')}: </span><span className="font-semibold">{l(ev.dressCode)}</span></span>
          </p>
        )}
        {ev.notes && <p className="mt-2 text-[0.92rem] text-muted">{l(ev.notes)}</p>}
        {(ev.needsConfirmation || ev.status === 'tbd' || (view === 'both' && ev.timeBySide)) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(ev.needsConfirmation || ev.status === 'tbd') && <ConfirmBadge />}
            {view === 'both' && <DiffersBadge ev={ev} />}
          </div>
        )}
      </button>
    </li>
  );
}
