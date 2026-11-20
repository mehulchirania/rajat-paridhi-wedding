import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../lib/app';
import { meta } from '../lib/data';
import { keep } from '../lib/nav';
import { DayChips } from './DayChips';
import { HelpButton } from './HelpFab';
import { Icon } from './Icons';
import { LangToggle, SidePill } from './Toggles';

function useOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false);
    window.addEventListener('online', u); window.addEventListener('offline', d);
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d); };
  }, []);
  return on;
}

const dockItem = 'tap flex w-[84px] flex-col items-center justify-center gap-0.5 rounded-full text-[0.78rem] font-semibold leading-none transition-colors duration-200';

export function Shell() {
  const { t, l, lang, side, setSplash } = useApp();
  const loc = useLocation();
  const online = useOnline();
  const onDay = loc.pathname.startsWith('/day/');
  const brand = side === 'bride' ? t('brand.brideFirst') : side === 'groom' ? t('brand.groomFirst') : t('brand.neutral');
  const first = (n: string) => n.split(' ')[0];
  const g = first(l(meta.couple.groom.name)), b = first(l(meta.couple.bride.name));
  const wordmark = lang === 'hi' ? t('app.eventTitle') : side === 'bride' ? `${b} & ${g}` : `${g} & ${b}`;
  const title = lang === 'hi' ? t('app.eventTitle') : brand;
  useEffect(() => { document.title = `${title} — ${lang === 'hi' ? brand : t('app.eventTitle')}`; }, [title, brand, lang, t]);
  const updated = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(meta.lastUpdated));
  const itinActive = onDay;
  const infoActive = loc.pathname.startsWith('/info');

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      {!online && <p role="status" className="bg-amber-soft px-4 py-2 text-center text-[0.9rem] font-semibold text-amber-ink">{t('offline.note')}</p>}
      <div className="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur-md">
        <header className="flex h-14 items-center justify-between gap-2 px-4">
          <Link to={`/${keep()}`} className="font-display min-w-0 truncate text-[1.35rem] leading-none text-oxblood">{wordmark}</Link>
          <div className="flex shrink-0 items-center gap-1.5"><SidePill /><LangToggle /></div>
        </header>
        {onDay && <div className="px-2"><DayChips /></div>}
      </div>
      <main className="px-4 pt-4"><Outlet /></main>
      <footer className={`px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-10 text-center text-[0.82rem] text-ink-2 ${infoActive ? 'sr-only' : ''}`}>
        <p>{t('footer.updated', { date: updated })}</p>
        <button type="button" onClick={() => setSplash(true)} className="tap mt-1 underline decoration-line underline-offset-4">{t('footer.replay')}</button>
        <span className="sr-only">{g}</span>
      </footer>
      <nav aria-label={t('shell.dockLabel')}
        className="fixed left-1/2 z-40 flex h-16 -translate-x-1/2 items-center gap-1 rounded-full bg-ivory px-2 shadow-[0_10px_30px_-12px_rgb(30_20_22/.35)]"
        style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Link to={`/${keep()}`} aria-current={itinActive ? 'page' : undefined} className={`${dockItem} ${itinActive ? 'text-oxblood' : 'text-ink-2'}`}>
          <span className="flex h-8 items-center"><Icon name="cal" /></span>{t('nav.itinerary')}
        </Link>
        <NavLink to={`/info${keep()}`} className={`${dockItem} ${infoActive ? 'text-oxblood' : 'text-ink-2'}`}>
          <span className="flex h-8 items-center"><Icon name="pin" /></span>{t('nav.info')}
        </NavLink>
        <HelpButton className={`${dockItem} text-ink-2`} />
      </nav>
    </div>
  );
}
