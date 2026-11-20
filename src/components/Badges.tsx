import type { EventItem, Side } from '../types';
import { useApp } from '../lib/app';
import { differsBySide } from '../lib/data';

const dotCls = (side: Side) => side === 'groom' ? 'bg-groom' : side === 'bride' ? 'bg-bride' : 'bg-gradient-to-br from-groom to-bride';
export const sideInk = (side: Side) => side === 'groom' ? 'text-groom-ink' : side === 'bride' ? 'text-bride-ink' : 'text-ink-2';

/** Side marker: small dot + coloured word. No pill. */
export function SideBadge({ side }: { side: Side }) {
  const { t } = useApp();
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.9rem] font-semibold leading-tight ${sideInk(side)}`}>
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${dotCls(side)}`} />
      {t(`side.${side}.short`)}
    </span>
  );
}

export function CityBadge({ city }: { city: EventItem['city'] }) {
  const { t } = useApp();
  return <span className="inline-flex items-center text-[0.9rem] leading-tight text-ink-2">{t(`city.${city}`)}</span>;
}

/** "● Timing being confirmed" — amber dot + amber-ink text. */
export function ConfirmBadge() {
  const { t } = useApp();
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium leading-tight text-amber-ink">
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#D9A21B]" />
      {t('badge.confirming')}
    </span>
  );
}

/** "Groom 7:00 PM · Bride 6:30 PM" with coloured names. */
export function DiffersBadge({ ev }: { ev: EventItem }) {
  const { t, time } = useApp();
  if (!differsBySide(ev) || !ev.time) return null;
  const g = ev.timeBySide?.groom ?? ev.time;
  const b = ev.timeBySide?.bride ?? ev.time;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 text-[0.9rem] leading-snug text-ink">
      <span><span className="font-semibold text-groom-ink">{t('side.groom.short')}</span> {time(g)}</span>
      <span aria-hidden="true" className="text-ink-2">·</span>
      <span><span className="font-semibold text-bride-ink">{t('side.bride.short')}</span> {time(b)}</span>
    </span>
  );
}
