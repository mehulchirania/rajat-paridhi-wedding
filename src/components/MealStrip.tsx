import { EventBadge } from './Icons';
import type { EventItem, GuestSide } from '../types';
import { useApp } from '../lib/app';
import { meta, resolveTime, sortEvents } from '../lib/data';
import { timeParts } from './EventCard';

export function MealStrip({ meals, view, onOpen }: { meals: EventItem[]; view: GuestSide; onOpen: (id: string) => void }) {
  const { t, l, lang } = useApp();
  if (!meals.length) return null;
  const sorted = sortEvents(meals, view);
  return (
    <section aria-labelledby="meals-h" className="mt-8 rounded-[20px] bg-sand px-2 pb-4 pt-4">
      <h2 id="meals-h" className="px-3 text-[0.78rem] font-semibold uppercase tracking-[.14em] text-champagne-ink [html[lang=hi]_&]:text-[0.85rem] [html[lang=hi]_&]:tracking-normal">{t('meals.eyebrow')}</h2>
      <ul className="mt-2 flex divide-x divide-line">
        {sorted.map((m) => {
          const rt = resolveTime(m, view);
          const p = rt ? timeParts(rt, lang) : null;
          return (
            <li key={m.id} className="min-w-0 flex-1">
              <button type="button" onClick={() => onOpen(m.id)} className="flex min-h-[64px] w-full flex-col items-start justify-center px-3 py-1 text-left transition-opacity active:opacity-70">
                <span className="flex items-center gap-2"><EventBadge ev={m} size={26} /><span className="font-display text-[1.2rem] leading-tight text-ink">{l(m.title)}</span></span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.9rem] text-ink-2" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
                  {p ? `${p.num} ${p.per}` : t('time.tba')}
                  {m.needsConfirmation && (
                    <>
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#D9A21B]" />
                      <span className="sr-only">{t('badge.confirming')}</span>
                    </>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 px-3 text-[0.9rem] leading-snug text-ink-2">{l(meta.teaCoffee)}</p>
    </section>
  );
}
