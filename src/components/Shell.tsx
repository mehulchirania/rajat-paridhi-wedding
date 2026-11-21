import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';
import { meta } from '../lib/data';
import { keep } from '../lib/nav';
import { DayChips } from './DayChips';
import { HelpButton } from './HelpFab';
import { Icon } from './Icons';
import { LangToggle, SidePill, TextSizeToggle } from './Toggles';

function useOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false);
    window.addEventListener('online', u); window.addEventListener('offline', d);
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d); };
  }, []);
  return on;
}

const dockItem = 'tap flex min-w-[5.25rem] flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-1.5 text-[0.8rem] font-semibold leading-none shadow-sm transition-colors duration-200 active:scale-[.97]';
const dockOn = 'border-oxblood bg-oxblood text-ivory';
const dockOff = 'border-line bg-sand text-ink hover:bg-line/60';

export function Shell() {
  const { t, l, lang, side} = useApp();
  const goWelcome = useNavigate();
  const loc = useLocation();
  const online = useOnline();
  const onDay = loc.pathname.startsWith('/day/');
  const brand = side === 'bride' ? t('brand.brideFirst') : side === 'groom' ? t('brand.groomFirst') : t('brand.neutral');
  const first = (n: string) => n.split(' ')[0];
  const g = first(l(meta.couple.groom.name)), b = first(l(meta.couple.bride.name));
  const wordmark = side === 'bride' ? `${b} & ${g}` : `${g} & ${b}`;
  const title = lang === 'hi' ? t('app.eventTitle') : brand;
  useEffect(() => { document.title = `${title} — ${lang === 'hi' ? brand : t('app.eventTitle')}`; }, [title, brand, lang, t]);
  const updated = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(meta.lastUpdated));
  const itinActive = onDay;
  const infoActive = loc.pathname.startsWith('/info');

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      {!online && <p role="status" className="bg-amber-soft px-4 py-2 text-center text-[0.9rem] font-semibold text-amber-ink">{t('offline.note')}</p>}
      <div className="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur-md">
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-1">
          <button type="button" onClick={() => goWelcome(`/welcome${keep()}`, { state: { from: loc.pathname + loc.search } })} aria-label={`${wordmark} — ${t('footer.replay')}`} className="tap -ml-1 min-w-[8rem] flex-1 truncate px-1 text-left font-display text-[1.15rem] leading-none text-oxblood">{wordmark.split(' & ')[0]} <span aria-hidden="true" className="text-[0.8em]">♥</span> {wordmark.split(' & ')[1]}</button>
          <div className="flex shrink-0 items-center gap-1.5"><SidePill /><TextSizeToggle /><LangToggle /></div>
        </header>
        {onDay && <div className="px-2"><DayChips /></div>}
      </div>
      <main className="px-4 pt-4"><Outlet /></main>
      <footer className={`px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-10 text-center text-[0.82rem] text-ink-2 ${infoActive ? 'sr-only' : ''}`}>
        <p>{t('footer.updated', { date: updated })}</p>
        <button type="button" onClick={() => goWelcome(`/welcome${keep()}`, { state: { from: loc.pathname + loc.search } })} className="tap mt-1 underline decoration-line underline-offset-4">{t('footer.replay')}</button>
        <span className="sr-only">{g}</span>
      </footer>
      <nav aria-label={t('shell.dockLabel')}
        className="fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-3xl border border-line bg-ivory p-1.5 shadow-[0_10px_30px_-12px_rgb(30_20_22/.45)]"
        style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Link to={`/${keep()}`} aria-current={itinActive ? 'page' : undefined} className={`${dockItem} ${itinActive ? dockOn : dockOff}`}>
          <span className="flex h-7 items-center"><Icon name="cal" /></span>{t('nav.itinerary')}
        </Link>
        <NavLink to={`/info${keep()}`} className={`${dockItem} ${infoActive ? dockOn : dockOff}`}>
          <span className="flex h-7 items-center"><Icon name="pin" /></span>{t('nav.info')}
        </NavLink>
        <HelpButton className={`${dockItem} border-wa bg-wa text-white`} />
      </nav>
    </div>
  );
}
