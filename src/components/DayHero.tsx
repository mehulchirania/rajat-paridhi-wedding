import { useApp } from '../lib/app';
import { resolveTime } from '../lib/data';
import { dayNum, istToday, monthIdx, weekday } from '../lib/time';
import { Swatch } from './Swatch';
import { dayPhoto, photo } from '../lib/photos';
import { Photo } from './Photo';
import { useTick } from './NowNext';
import type { EventItem } from '../types';

const CSS = `@keyframes hero-settle{from{transform:scale(1.04)}to{transform:none}}
.hero-settle{animation:hero-settle .9s var(--ease-out) both}
@media (prefers-reduced-motion:reduce){.hero-settle{animation:none}}`;

/** Frosted chip: where this day sits relative to today (IST) — "Today", "Tomorrow", "In 9 days", "Completed". */
function WhenChip({ date }: { date: string }) {
  const { t } = useApp();
  const now = useTick(60_000);
  const today = istToday(now);
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  const label = days === 0 ? t('dayhero.today') : days === 1 ? t('dayhero.tomorrow') : days > 1 ? t('dayhero.inDays', { n: days }) : t('dayhero.done');
  return (
    <span className={`absolute right-3 top-3 z-10 rounded-full px-3 py-1.5 text-[0.85rem] font-semibold leading-tight ring-1 backdrop-blur-md ${days === 0 ? 'bg-ivory text-oxblood ring-ivory' : 'bg-white/20 text-white ring-white/30'}`}>
      {days === 0 && <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-oxblood align-middle motion-reduce:animate-none" />}
      {label}
    </span>
  );
}

/** "10:00 AM – 8:00 PM" span of the visible timed events. */
function useSpan(events: EventItem[]) {
  const { side, time } = useApp();
  const times = events.map((e) => resolveTime(e, side)).filter((x): x is string => !!x).sort();
  if (!times.length) return '';
  return times.length === 1 ? time(times[0]) : `${time(times[0])} – ${time(times[times.length - 1])}`;
}

/** Outfit plan for the day: each distinct dress code, in order, with the time it's first needed. */
export function OutfitStrip({ events }: { events: EventItem[] }) {
  const { t, l, side, time } = useApp();
  const seen = new Set<string>();
  const items = [...events]
    .filter((e) => e.dressCode)
    .sort((a, b) => (resolveTime(a, side) ?? '99').localeCompare(resolveTime(b, side) ?? '99'))
    .filter((e) => { const k = e.dressCode!.en; if (seen.has(k)) return false; seen.add(k); return true; });
  if (!items.length) return null;
  return (
    <section aria-labelledby="outfits-h" className="mt-4">
      <h2 id="outfits-h" className="text-[0.78rem] font-semibold uppercase tracking-[.14em] text-champagne-ink [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]">{t('dayhero.outfits')}</h2>
      <ul className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {items.map((e) => {
          const rt = resolveTime(e, side);
          return (
            <li key={e.id} title={l(e.title)} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-ivory py-1.5 pl-1.5 pr-3.5">
              <Swatch kind={e.dressCode!.swatch} size={22} />
              <span className="text-[0.9rem] leading-tight">
                <span className="font-semibold text-ink">{l(e.dressCode)}</span>
                <span className="block text-[0.78rem] text-ink-2">{rt ? t('dayhero.from', { t: time(rt) }) : l(e.title)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DayHero({ date, dayIndex, events }: { date: string; dayIndex: number; events: EventItem[] }) {
  const { t } = useApp();
  const p = dayPhoto(date) ?? photo(undefined);
  const venues = [...new Set(events.map((e) => e.venueName ?? ''))];
  const cities = [...new Set(events.map((e) => e.city))];
  const where = venues.length === 1 && venues[0]
    ? venues[0]
    : cities.length === 1 && cities[0] !== 'TBD' ? t(`city.${cities[0]}`)
    : cities.filter((c) => c !== 'TBD').length > 1 ? cities.filter((c) => c !== 'TBD').map((c) => t(`city.${c}`)).join(' · ')
    : t('dayhero.venueTba');
  const span = useSpan(events);
  const meta = events.length === 0 ? t('dayhero.none') : t(events.length === 1 ? 'dayhero.meta.one' : 'dayhero.meta.other', { n: events.length, where });
  return (
    <header className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-sand">
      <style>{CSS}</style>
      <div className="hero-settle absolute inset-0">
        <Photo p={p} priority className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
      <WhenChip date={date} />
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[.14em] text-white/90 [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]">
          {t('dayhero.eyebrow', { n: dayIndex + 1, wd: t(`wdf.${weekday(date)}`) })}
        </p>
        <h1 className="mt-0.5 font-display text-[2.6rem] leading-[1.05]">{dayNum(date)} {t(`mof.${monthIdx(date)}`)}</h1>
        <p className="mt-1 text-[0.9rem] leading-snug text-white/90">{meta}</p>
        {span && <p className="mt-0.5 text-[0.9rem] font-semibold leading-snug text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{span}</p>}
      </div>
    </header>
  );
}
