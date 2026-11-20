import { useApp } from '../lib/app';
import type { GuestSide } from '../types';

const seg = 'tap flex-1 px-3 text-[0.92rem] font-bold transition-colors';

export function SideToggle() {
  const { side, setSide, t } = useApp();
  const opts: { v: GuestSide; on: string }[] = [
    { v: 'groom', on: 'bg-groom text-white' },
    { v: 'bride', on: 'bg-bride text-white' },
    { v: 'both', on: 'bg-maroon text-cream' },
  ];
  return (
    <div role="group" aria-label={t('side.toggle')} className="flex flex-1 overflow-hidden rounded-xl border-2 border-maroon/70 bg-paper">
      {opts.map((o) => (
        <button key={o.v} type="button" aria-pressed={side === o.v} onClick={() => setSide(o.v)} className={`${seg} ${side === o.v ? o.on : 'text-maroon'}`}>
          {t(`side.${o.v}.short`)}
        </button>
      ))}
    </div>
  );
}

export function LangToggle() {
  const { lang, setLang, t } = useApp();
  return (
    <div role="group" aria-label={t('lang.toggle')} className="flex overflow-hidden rounded-xl border-2 border-maroon/70 bg-paper">
      {([['en', 'EN'], ['hi', 'हिं']] as const).map(([v, label]) => (
        <button key={v} type="button" lang={v} aria-pressed={lang === v} onClick={() => setLang(v)}
          className={`${seg} px-2.5 ${lang === v ? 'bg-maroon text-cream' : 'text-maroon'}`}>{label}</button>
      ))}
    </div>
  );
}

export function SizeToggle() {
  const { bigText, setBigText, t } = useApp();
  return (
    <button type="button" aria-pressed={bigText} aria-label={t('size.toggle')} onClick={() => setBigText(!bigText)}
      className={`tap rounded-xl border-2 border-maroon/70 px-3 font-display text-[1.15rem] font-bold ${bigText ? 'bg-maroon text-cream' : 'bg-paper text-maroon'}`}>A+</button>
  );
}
