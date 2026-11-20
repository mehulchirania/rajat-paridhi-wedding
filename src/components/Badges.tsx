import type { EventItem, Side } from '../types';
import { useApp } from '../lib/app';
import { differsBySide } from '../lib/data';
import { Icon } from './Icons';

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.78rem] font-semibold leading-tight whitespace-nowrap';

export function SideBadge({ side }: { side: Side }) {
  const { t } = useApp();
  const cls = side === 'groom' ? 'bg-groom-soft text-groom-ink border-groom/40' : side === 'bride' ? 'bg-bride-soft text-bride-ink border-bride/40' : 'grad-common text-maroon border-maroon/25';
  return <span className={`${base} border ${cls}`}>{t(`side.${side}.short`)}</span>;
}

export function CityBadge({ city }: { city: EventItem['city'] }) {
  const { t } = useApp();
  return <span className={`${base} border border-gold-dark/40 bg-paper text-gold-dark`}><Icon name="pin" size={13} />{t(`city.${city}`)}</span>;
}

export function ConfirmBadge() {
  const { t } = useApp();
  return <span className={`${base} border border-amber-ink/30 bg-amber-soft text-amber-ink`}><Icon name="clock" size={13} />{t('badge.confirming')}</span>;
}

export function DiffersBadge({ ev }: { ev: EventItem }) {
  const { t, time } = useApp();
  if (!differsBySide(ev) || !ev.time) return null;
  const g = ev.timeBySide?.groom ?? ev.time;
  const b = ev.timeBySide?.bride ?? ev.time;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl border border-maroon/25 bg-paper px-2.5 py-1 text-[0.8rem] font-semibold text-maroon">
      <span>{t('badge.differs')}:</span>
      <span className="text-groom-ink">{t('differs.groom', { time: time(g) })}</span>
      <span className="text-bride-ink">{t('differs.bride', { time: time(b) })}</span>
    </span>
  );
}
