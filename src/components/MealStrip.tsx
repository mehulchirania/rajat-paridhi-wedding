import type { EventItem, GuestSide } from '../types';
import { useApp } from '../lib/app';
import { resolveTime, sortEvents } from '../lib/data';
import { Icon } from './Icons';
import { ConfirmBadge } from './Badges';
import { meta } from '../lib/data';

export function MealStrip({ meals, view, onOpen }: { meals: EventItem[]; view: GuestSide; onOpen: (id: string) => void }) {
  const { t, l, time } = useApp();
  if (!meals.length) return null;
  const sorted = sortEvents(meals, view);
  return (
    <section aria-labelledby="meals-h" className="mt-5 rounded-2xl border border-gold/50 bg-paper p-3">
      <h2 id="meals-h" className="mb-2 flex items-center gap-2 font-display text-[1.25rem] font-bold text-maroon"><Icon name="meal" size={20} />{t('day.meals')}</h2>
      <ul className="grid grid-cols-3 gap-2">
        {sorted.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => onOpen(m.id)} className="tap flex h-full w-full flex-col items-center justify-center rounded-xl border border-gold/40 bg-cream px-1 py-2 text-center">
              <Icon name={m.icon === 'tea' ? 'tea' : 'meal'} size={20} className="text-gold-dark" />
              <span className="mt-0.5 text-[0.92rem] font-bold text-maroon">{l(m.title)}</span>
              <span className="text-[0.9rem]">{time(resolveTime(m, view) ?? '00:00')}</span>
              {m.needsConfirmation && <span className="mt-1"><ConfirmBadge /></span>}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center gap-2 text-[0.92rem] text-ink"><Icon name="tea" size={18} className="shrink-0 text-gold-dark" />{l(meta.teaCoffee)}</p>
    </section>
  );
}
