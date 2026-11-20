import { useApp } from '../lib/app';
import { nikasi, startMs } from '../lib/data';
import { dayNum, monthIdx, weekday } from '../lib/time';
import { dayPhoto, photo } from '../lib/photos';
import { Photo } from './Photo';
import { useTick } from './NowNext';
import type { EventItem } from '../types';

const CSS = `@keyframes hero-settle{from{transform:scale(1.04)}to{transform:none}}
.hero-settle{animation:hero-settle .9s var(--ease-out) both}
@media (prefers-reduced-motion:reduce){.hero-settle{animation:none}}`;

/** Frosted "Nikasi in 11d 9h" chip. Groom/both views only, and only until Nikasi starts. */
function NikasiChip() {
  const { t, side } = useApp();
  const now = useTick();
  if (!nikasi || side === 'bride') return null;
  const st = startMs(nikasi, 'groom');
  if (st === null || st <= now) return null;
  const diff = st - now;
  const d = Math.floor(diff / 86_400_000), h = Math.floor(diff / 3_600_000) % 24, m = Math.floor(diff / 60_000) % 60;
  const label = d > 0 ? t('dayhero.nikasiDH', { d, h }) : t('dayhero.nikasiHM', { h, m });
  return (
    <span role="timer" aria-label={t('countdown.title')} className="absolute right-3 top-3 z-10 rounded-full bg-white/20 px-3 py-1.5 text-[0.85rem] font-semibold leading-tight text-white ring-1 ring-white/30 backdrop-blur-md">
      {label}
    </span>
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
  const meta = events.length === 0 ? t('dayhero.none') : t(events.length === 1 ? 'dayhero.meta.one' : 'dayhero.meta.other', { n: events.length, where });
  return (
    <header className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-sand">
      <style>{CSS}</style>
      <div className="hero-settle absolute inset-0">
        <Photo p={p} priority className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
      <NikasiChip />
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[.14em] text-white/90 [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.85rem]">
          {t('dayhero.eyebrow', { n: dayIndex + 1, wd: t(`wdf.${weekday(date)}`) })}
        </p>
        <h1 className="mt-0.5 font-display text-[2.6rem] leading-[1.05]">{dayNum(date)} {t(`mof.${monthIdx(date)}`)}</h1>
        <p className="mt-1 text-[0.9rem] leading-snug text-white/90">{meta}</p>
      </div>
    </header>
  );
}
