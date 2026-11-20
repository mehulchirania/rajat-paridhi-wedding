import { NavLink } from 'react-router-dom';
import { useApp } from '../lib/app';
import { days } from '../lib/data';
import { keep } from '../lib/nav';
import { dayNum, monthIdx, weekday } from '../lib/time';

/** Day ribbon: four equal columns, no boxes. Active day = oxblood numeral + 2px underline. */
export function DayChips() {
  const { t } = useApp();
  return (
    <nav aria-label={t('days.label')} className="grid grid-cols-4">
      {days.map((d) => (
        <NavLink key={d.slug} to={`/day/${d.slug}${keep()}`}
          className={({ isActive }) => `tap flex flex-col items-center justify-center border-b-2 pb-1.5 pt-2 leading-none transition-colors duration-200 ${isActive ? 'border-oxblood text-oxblood' : 'border-transparent text-ink-2'}`}>
          <span className="eyebrow">{t(`wd.${weekday(d.date)}`)}</span>
          <span className="font-display tnum mt-1 text-[2rem] leading-none">{dayNum(d.date)}</span>
          <span className="mt-1 text-[0.8rem] font-medium">{t(`mo.${monthIdx(d.date)}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
