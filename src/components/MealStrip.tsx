import { EventBadge } from './Icons';
import type { EventItem, GuestSide } from '../types';
import { useApp } from '../lib/app';
import { meta, resolveTime, sortEvents } from '../lib/data';
import { timeParts } from './EventCard';

/** Meals as a tidy list: icon, name, and a right-aligned time, so long names (Hindi, "Afternoon Hi-Tea") never collide. */
export function MealStrip({ meals, view, onOpen }: { meals: EventItem[]; view: GuestSide; onOpen: (id: string) => void }) {
  const { t, l, lang } = useApp();
  if (!meals.length) return null;
  const sorted = sortEvents(meals, view);
  return (
    <section aria-labelledby="meals-h" className="mt-8 rounded-[20px] bg-sand px-2 pb-4 pt-4">
      <h2 id="meals-h" className="px-3 text-[0.78rem] font-semibold uppercase tracking-[.14em] text-champagne-ink [html[lang=hi]_&]:text-[0.85rem] [html[lang=hi]_&]:tracking-normal">{t('meals.eyebrow')}</h2>
      <ul className="mt-1 divide-y divide-line">
        {sorted.map((m) => {
          const rt = resolveTime(m, view);
          const p = rt ? timeParts(rt, lang) : null;
          return (
            <li key={m.id}>
              <button type="button" onClick={() => onOpen(m.id)} className="flex min-h-[52px] w-full items-center gap-3 px-3 py-2 text-left transition-opacity active:opacity-70">
                <EventBadge ev={m} size={30} />
                <span className="min-w-0 flex-1 font-display text-[1.2rem] leading-tight text-ink">{l(m.title)}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-[0.95rem] font-medium text-ink" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
                  {p ? `${p.num} ${p.per}` : t('time.tba')}
                  {m.needsConfirmation && (
                    <>
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-marigold" />
                      <span className="sr-only">{t('badge.confirming')}</span>
                    </>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex items-start gap-1.5 border-t border-line px-3 pt-3 text-[0.9rem] leading-snug text-ink-2">{l(meta.teaCoffee)}</p>
    </section>
  );
}
