import { useEffect, useState } from 'react';
import { useApp } from '../lib/app';
import { nowMs, toInstant } from '../lib/time';

/** Main celebrations start 1 Dec 2026, 00:00 IST. The countdown disappears at that instant. */
export const MAIN_START = toInstant('2026-12-01', '00:00');

export function Countdown({ className = '' }: { className?: string }) {
  const { t } = useApp();
  const [now, setNow] = useState(nowMs);
  useEffect(() => { const i = setInterval(() => setNow(nowMs()), 1000); return () => clearInterval(i); }, []);
  const diff = MAIN_START - now;
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  const parts: [number, string][] = [
    [Math.floor(s / 86400), 'countdown.days'],
    [Math.floor(s / 3600) % 24, 'countdown.hours'],
    [Math.floor(s / 60) % 60, 'countdown.mins'],
    [s % 60, 'countdown.secs'],
  ];
  return (
    <section aria-label={t('countdown.title')} className={className}>
      <p className="eyebrow text-white/80">{t('countdown.title')}</p>
      {/* Visible digits tick every second; screen readers get a calm summary instead of per-second announcements. */}
      <div aria-hidden="true" className="mt-2.5 grid grid-cols-4 divide-x divide-white/20 border-y border-white/20 py-2.5">
        {parts.map(([v, k]) => (
          <div key={k} className="flex flex-col items-center">
            <span className="font-display text-[2rem] leading-none text-white" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{String(v).padStart(2, '0')}</span>
            <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[.14em] text-champagne [html[lang=hi]_&]:tracking-normal [html[lang=hi]_&]:text-[0.8rem]">{t(k)}</span>
          </div>
        ))}
      </div>
      <p className="sr-only">{`${parts[0][0]} ${t('countdown.days')}, ${parts[1][0]} ${t('countdown.hours')}`}</p>
    </section>
  );
}
