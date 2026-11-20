import { useApp } from '../lib/app';
import { meta } from '../lib/data';
import type { GuestSide } from '../types';
import { Knot } from './Knot';
import { LangToggle } from './Toggles';

export function Splash() {
  const { t, setSide, setSplash, l } = useApp();
  const pick = (s: GuestSide) => { setSide(s); setSplash(false); };
  const btn = 'tap w-full rounded-2xl border-2 px-5 py-3.5 text-[1.15rem] font-bold shadow-md active:scale-[.98]';
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-maroon px-6 py-10 text-center text-cream" style={{ backgroundImage: 'url(/images/pattern-paisley-light.svg)', backgroundSize: '240px' }}>
      <div className="absolute right-4 top-4"><LangToggle /></div>
      <Knot className="mb-2 w-52" />
      <p lang="hi" className="font-display text-[2.1rem] font-bold leading-snug text-gold" style={{ animation: 'var(--animate-rise)' }}>॥ जय श्री कृष्ण ॥</p>
      <p lang="en" className="font-display text-[1.35rem] italic text-cream/90">Jai Shri Krishna</p>
      <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-none">{t('brand.neutral')}</h1>
      <p className="mt-1 font-display text-[1.5rem] text-gold">{t('app.eventTitle')}</p>
      <p className="mt-3 max-w-sm text-[0.98rem] text-cream/90">{t('splash.invite')}</p>
      <p className="mt-1 text-[0.98rem] font-semibold">{t('splash.dates')} · {meta.hotel.name}</p>
      <section aria-labelledby="pick-h" className="mt-8 w-full max-w-sm space-y-3" style={{ animation: 'var(--animate-rise)', animationDelay: '1.6s' }}>
        <h2 id="pick-h" className="font-display text-[1.45rem] font-bold">{t('splash.pick')}</h2>
        <button type="button" onClick={() => pick('groom')} className={`${btn} border-[#6FA0E8] bg-groom text-white`}>{t('side.groom')}</button>
        <button type="button" onClick={() => pick('bride')} className={`${btn} border-[#F08FB4] bg-bride text-white`}>{t('side.bride')}</button>
        <button type="button" onClick={() => pick('both')} className={`${btn} border-gold bg-cream text-maroon`}>{t('side.both')}</button>
        <p className="text-[0.9rem] text-cream/80">{t('splash.hint')}</p>
      </section>
      <span className="sr-only">{l(meta.couple.groom.name)} {l(meta.couple.bride.name)}</span>
    </main>
  );
}
