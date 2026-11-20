import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../lib/app';
import { meta } from '../lib/data';
import { keep } from '../lib/nav';
import { DayChips } from './DayChips';
import { HelpFab } from './HelpFab';
import { Icon } from './Icons';
import { LangToggle, SideToggle, SizeToggle } from './Toggles';

function useOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const u = () => setOn(true), d = () => setOn(false);
    window.addEventListener('online', u); window.addEventListener('offline', d);
    return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d); };
  }, []);
  return on;
}

export function Shell() {
  const { t, l, lang, side, setSplash } = useApp();
  const loc = useLocation();
  const online = useOnline();
  const onDay = loc.pathname.startsWith('/day/');
  const brand = side === 'bride' ? t('brand.brideFirst') : side === 'groom' ? t('brand.groomFirst') : t('brand.neutral');
  const title = lang === 'hi' ? t('app.eventTitle') : brand;
  useEffect(() => { document.title = `${title} — ${lang === 'hi' ? brand : t('app.eventTitle')}`; }, [title, brand, lang, t]);
  const updated = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(meta.lastUpdated));
  const navCls = ({ isActive }: { isActive: boolean }) => `tap flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[0.82rem] font-bold ${isActive ? 'text-maroon' : 'text-muted'}`;

  return (
    <div className="mx-auto min-h-dvh max-w-xl pb-40">
      {!online && <p role="status" className="bg-amber-soft px-4 py-2 text-center text-[0.9rem] font-semibold text-amber-ink">{t('offline.note')}</p>}
      <header className="flex items-start justify-between gap-3 px-4 pb-2 pt-5">
        <div>
          <h1 className="font-display text-[2rem] font-bold leading-none text-maroon">{title}</h1>
          <p className="mt-1 font-display text-[1.15rem] text-gold-dark">{lang === 'hi' ? brand : t('app.eventTitle')} · {t('header.dates')}</p>
        </div>
        <SizeToggle />
      </header>
      <div className="sticky top-0 z-30 space-y-1.5 border-b-2 border-gold/60 bg-cream/95 px-3 py-2 backdrop-blur">
        <div className="flex gap-2"><SideToggle /><LangToggle /></div>
        {onDay && <DayChips />}
      </div>
      <main className="px-4 pt-4"><Outlet /></main>
      <footer className="px-4 pb-6 pt-8 text-center text-[0.85rem] text-muted">
        <p>{t('footer.updated', { date: updated })}</p>
        <button type="button" onClick={() => setSplash(true)} className="tap mt-1 font-semibold text-maroon underline">{t('footer.replay')}</button>
        <span className="sr-only">{l(meta.couple.groom.name)}</span>
      </footer>
      <HelpFab />
      <nav aria-label={t('nav.main')} className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-gold/60 bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-xl">
          <Link to={`/${keep()}`} aria-current={onDay ? 'page' : undefined} className={navCls({ isActive: onDay })}><Icon name="cal" />{t('nav.itinerary')}</Link>
          <NavLink to={`/info${keep()}`} className={navCls}><Icon name="pin" />{t('nav.info')}</NavLink>
          <NavLink to={`/gallery${keep()}`} className={navCls}><Icon name="image" />{t('nav.gallery')}</NavLink>
        </div>
      </nav>
    </div>
  );
}
