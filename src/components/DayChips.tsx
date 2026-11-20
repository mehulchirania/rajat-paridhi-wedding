import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../lib/app';
import { days } from '../lib/data';
import { dayNum, monthIdx, weekday } from '../lib/time';
import { keep } from '../lib/nav';

export function DayChips() {
  const { t } = useApp();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }); });
  return (
    <nav ref={ref} aria-label={t('days.label')} className="flex gap-1.5 overflow-x-auto pb-0.5">
      {days.map((d) => (
        <NavLink key={d.slug} to={`/day/${d.slug}${keep()}`}
          className={({ isActive }) => `tap flex min-w-[76px] flex-1 flex-col items-center justify-center rounded-xl border-2 px-2 py-1 leading-tight ${isActive ? 'border-maroon bg-maroon text-cream' : 'border-gold/60 bg-paper text-maroon'}`}>
          <span className="text-[1rem] font-bold">{dayNum(d.date)} {t(`mo.${monthIdx(d.date)}`)}</span>
          <span className="text-[0.78rem] opacity-90">{t(`wd.${weekday(d.date)}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
