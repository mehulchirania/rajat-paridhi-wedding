import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';
import { defaultDaySlug, keep } from '../lib/nav';
import { Countdown } from './Countdown';
import { meta } from '../lib/data';
import { splashPhoto } from '../lib/photos';
import type { GuestSide } from '../types';
import { Photo } from './Photo';
import { LangToggle, SideDot } from './Toggles';

const first = (n: string) => n.split(' ')[0];

export function Splash() {
  const { t, lang, side, hasSide, setSide, l } = useApp();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const target = from && !from.startsWith('/welcome') ? from : `/day/${defaultDaySlug()}${keep()}`;
  const pick = (s: GuestSide) => { setSide(s); nav(target, { replace: !from }); };
  const rise = (delay: number) => ({ animation: 'var(--animate-rise)', animationDelay: `${delay}ms` });
  const btn = 'tap flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-[0.95rem] font-semibold leading-tight text-white transition-transform active:scale-[.97]';
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-oxblood text-white">
      <div className="absolute inset-0"><Photo p={splashPhoto()} priority className="h-full w-full" sizes="100vw" /></div>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgb(20 8 12 / .7) 0%, rgb(20 8 12 / .15) 26%, rgb(20 8 12 / .55) 48%, rgb(20 8 12 / .9) 100%)' }} />
      <div className="absolute right-4 top-4 z-10"><LangToggle tone="light" /></div>

      <header className="relative px-6 pt-8 text-center" style={rise(150)}>
        <p lang="hi" className="font-display text-[1.3rem] leading-snug text-champagne">॥ जय श्री कृष्ण ॥</p>
        {lang === 'en' && <p className="font-display text-[0.95rem] italic text-white/80">{t('splash.jsk')}</p>}
      </header>

      <div className="relative mx-auto w-full max-w-md px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
        <p className="eyebrow text-white/85" style={rise(250)}>{t('splash.dates')}</p>
        <h1 className="mt-3 font-display text-[3.2rem] leading-[.95]" style={rise(350)}>
          <span className="block">{first(l(meta.couple.groom.name))}</span>
          <span className="block italic text-champagne" aria-hidden="true">&amp;</span>
          <span className="block">{first(l(meta.couple.bride.name))}</span>
        </h1>
        <p className="mt-3 font-display text-[1.4rem] text-white/90" style={rise(450)}>{t('app.eventTitle')}</p>

        <Countdown className="mx-auto mt-6 max-w-sm" />

        {hasSide && (
          <button type="button" onClick={() => pick(side)} style={rise(550)}
            className="tap mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-[1rem] font-semibold text-oxblood shadow-lg transition-transform active:scale-[.98]">
            <SideDot side={side} size={10} />{side === 'both' ? t('splash.continueBoth') : t('splash.continue', { side: t(`side.${side}`) })} <span aria-hidden="true">→</span>
          </button>
        )}

        <section aria-labelledby="pick-h" className="mt-4 rounded-3xl border border-white/25 bg-white/12 p-3 backdrop-blur-md" style={rise(600)}>
          <h2 id="pick-h" className="eyebrow mb-2.5 text-white/90">{hasSide ? t('splash.change') : t('splash.pick')}</h2>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => pick('groom')} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="groom" size={10} />{t('side.groom')}</button>
            <button type="button" onClick={() => pick('bride')} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="bride" size={10} />{t('side.bride')}</button>
            <button type="button" onClick={() => pick('both')} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="both" size={10} />{t('side.both')}</button>
          </div>
          <p className="mt-2.5 text-[0.82rem] text-white/85">{t('splash.hint')}</p>
        </section>
      </div>
    </main>
  );
}
