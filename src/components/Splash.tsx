import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';
import { defaultDaySlug, keep } from '../lib/nav';
import { Countdown } from './Countdown';
import { meta } from '../lib/data';
import { splashPhoto } from '../lib/photos';
import type { GuestSide } from '../types';
import { Photo } from './Photo';
import { MusicToggle, type MusicHandle } from './MusicToggle';
import { PeacockFeather } from './PeacockFeather';
import { Petals } from './Petals';
import { Toran } from './Toran';
import { prefersReducedMotion } from '../lib/motion';
import { nowMs, toInstant } from '../lib/time';
import { LangToggle, SideDot, TextSizeToggle } from './Toggles';

const first = (n: string) => n.split(' ')[0];
const MARRIED_FROM = toInstant('2026-12-01', '19:00');
const MARRIED_UNTIL = toInstant('2026-12-03', '00:00');

export function Splash() {
  const { t, lang, side, hasSide, setSide, l } = useApp();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const target = from && !from.startsWith('/welcome') ? from : `/day/${defaultDaySlug()}${keep()}`;
  const music = useRef<MusicHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const [married] = useState(() => { const n = nowMs(); return n >= MARRIED_FROM && n < MARRIED_UNTIL; });
  useEffect(() => () => clearTimeout(timer.current), []);
  const pick = (s: GuestSide, e: MouseEvent<HTMLElement>, instant = false) => {
    if (timer.current) return; // already leaving
    const go = () => { setSide(s); nav(target, { replace: !from }); };
    music.current?.fadeOutAndStop(800);
    if (instant || prefersReducedMotion()) { go(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    try { navigator.vibrate?.(15); } catch { /* unsupported */ }
    timer.current = setTimeout(go, 450);
  };
  const rise = (delay: number) => ({ animation: 'var(--animate-rise)', animationDelay: `${delay}ms` });
  const btn = 'tap flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-[0.95rem] font-semibold leading-tight text-white transition-transform active:scale-[.97]';
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-oxblood text-white">
      <div className="kenburns absolute inset-0"><Photo p={splashPhoto()} priority className="h-full w-full" sizes="100vw" /></div>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgb(20 8 12 / .82) 0%, rgb(20 8 12 / .55) 20%, rgb(20 8 12 / .45) 38%, rgb(20 8 12 / .76) 52%, rgb(20 8 12 / .9) 100%)' }} />
      <Petals mode="drift" />
      <Toran />
      <div className="absolute right-4 top-[1.6rem] z-10 flex items-center gap-1.5"><MusicToggle ref={music} /><TextSizeToggle tone="light" /><LangToggle tone="light" /></div>

      <header className="relative flex flex-col items-center px-6 pt-[5.75rem] text-center" style={rise(150)}>
        <p lang="hi" className="font-display text-[1.3rem] leading-snug text-champagne [text-shadow:0_1px_8px_rgb(0_0_0/.75)]">॥ जय श्री कृष्ण ॥</p>
        {lang === 'en' && <p className="font-display text-[0.95rem] italic text-white [text-shadow:0_1px_8px_rgb(0_0_0/.75)]">{t('splash.jsk')}</p>}
        <PeacockFeather className="mt-2" />
      </header>

      <div className="relative mx-auto w-full max-w-md px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
        <p className="eyebrow text-[0.85rem] text-white [text-shadow:0_1px_8px_rgb(0_0_0/.8),0_0_2px_rgb(0_0_0/.6)]" style={rise(250)}>{t('splash.dates')}</p>
        {married && <p className="mt-3 font-display text-[1.25rem] italic text-champagne" style={rise(300)}>{t('splash.justMarried')}</p>}
        <h1 className="mt-3 font-display text-[3.2rem] leading-[.95]" style={rise(350)}>
          <span className="block">{first(l(meta.couple.groom.name))}</span>
          <span className="heartbeat my-1 block text-[2.4rem] leading-none text-heart [text-shadow:0_2px_10px_rgb(0_0_0/.55)]" aria-hidden="true">♥</span>
          <span className="block">{first(l(meta.couple.bride.name))}</span>
        </h1>
        <p className="mt-3 font-display text-[1.4rem] text-white/90" style={rise(450)}>{t('app.eventTitle')}</p>

        <Countdown className="mx-auto mt-6 max-w-sm" />

        {hasSide && (
          <button type="button" onClick={(e) => pick(side, e, true)} style={rise(550)}
            className="tap mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-[1rem] font-semibold text-oxblood shadow-lg transition-transform active:scale-[.98]">
            <SideDot side={side} size={10} />{side === 'both' ? t('splash.continueBoth') : t('splash.continue', { side: t(`side.${side}`) })} <span aria-hidden="true">→</span>
          </button>
        )}

        <section aria-labelledby="pick-h" className="mt-4 rounded-3xl border border-white/25 bg-white/12 p-3 backdrop-blur-md" style={rise(600)}>
          <h2 id="pick-h" className="eyebrow mb-2.5 text-white/90">{hasSide ? t('splash.change') : t('splash.pick')}</h2>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={(e) => pick('groom', e)} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="groom" size={10} />{t('side.groom')}</button>
            <button type="button" onClick={(e) => pick('bride', e)} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="bride" size={10} />{t('side.bride')}</button>
            <button type="button" onClick={(e) => pick('both', e)} className={`${btn} bg-white/10 hover:bg-white/20`}><SideDot side="both" size={10} />{t('side.both')}</button>
          </div>
          <p className="mt-2.5 text-[0.82rem] text-white/85">{t('splash.hint')}</p>
        </section>
      </div>
      {burst && <Petals mode="burst" origin={burst} durationMs={450} />}
    </main>
  );
}
