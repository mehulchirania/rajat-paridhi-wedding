import { useState } from 'react';
import { useApp } from '../lib/app';
import type { GuestSide } from '../types';
import { THEMES } from '../lib/themes';
import { Sheet } from './Sheet';

const dotCls: Record<GuestSide, string> = {
  groom: 'bg-groom',
  bride: 'bg-bride',
  both: 'bg-gradient-to-r from-groom to-bride',
};

export function SideDot({ side, size = 10 }: { side: GuestSide; size?: number }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${dotCls[side]}`} style={{ width: size, height: size }} />;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="tap flex w-full items-center justify-between gap-4 border-t border-line py-3 text-left">
      <span className="text-[1rem] font-medium text-ink">{label}</span>
      <span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-(--ease-out) ${checked ? 'bg-oxblood' : 'bg-ink-2/40'}`}>
        <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-200 ease-(--ease-out) ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

/** Swatch grid for the colour themes. Each swatch previews its own background, accent and ink. */
export function ThemePicker() {
  const { theme, setTheme, t } = useApp();
  return (
    <div role="radiogroup" aria-label={t('theme.title')} className="grid grid-cols-4 gap-x-2 gap-y-3 border-t border-line py-3">
      {THEMES.map((th) => {
        const on = theme === th.id;
        return (
          <button key={th.id} type="button" role="radio" aria-checked={on} onClick={() => setTheme(th.id)}
            className="tap flex flex-col items-center gap-1.5 text-center">
            <span aria-hidden="true" style={{ background: th.bg, borderColor: on ? th.accent : 'transparent' }}
              className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] shadow-[0_0_0_1px_rgba(128,128,128,.35)] transition-transform duration-200 ease-(--ease-out)">
              <span style={{ background: th.accent }} className="relative h-6 w-6 rounded-full">
                <span style={{ background: th.ink }} className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[inherit]" />
              </span>
            </span>
            <span className={`text-[0.78rem] leading-tight ${on ? 'font-semibold text-brand-ink' : 'text-ink-2'}`}>{t(`theme.${th.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Header pill showing the current side; opens a sheet with side options + display switches. */
export function SidePill() {
  const { side, setSide, t, showFamily, setShowFamily, bigText, setBigText } = useApp();
  const [open, setOpen] = useState(false);
  const label = t(`side.${side}.of`.replace('.of', side === 'both' ? '' : '.of'));
  const short = t(`side.${side}.short`);
  const opts: GuestSide[] = ['groom', 'bride', 'both'];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${t('side.toggle')}: ${label}`}
        className="tap inline-flex items-center gap-2 rounded-full border border-line bg-sand px-3 text-[0.9rem] font-semibold text-ink">
        <SideDot side={side} />
        <span className="whitespace-nowrap">{short}</span>
        <span aria-hidden="true" className="-ml-0.5 text-[0.7rem] text-ink-2">▾</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('shell.sheetTitle')} titleId="side-sheet-title">
        <div role="radiogroup" aria-label={t('side.toggle')} className="mb-2">
          {opts.map((o) => (
            <button key={o} type="button" role="radio" aria-checked={side === o} onClick={() => { setSide(o); setOpen(false); }}
              className={`flex min-h-[56px] w-full items-center gap-4 border-t border-line px-1 py-3 text-left text-[1.1rem] ${side === o ? 'font-semibold text-oxblood' : 'text-ink'}`}>
              <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${side === o ? 'border-oxblood' : 'border-ink-2/50'}`}>
                {side === o && <span className="h-3 w-3 rounded-full bg-oxblood" />}
              </span>
              <span className="flex-1">{t(`side.${o}`)}</span>
              <SideDot side={o} size={12} />
            </button>
          ))}
        </div>
        <Switch checked={showFamily} onChange={setShowFamily} label={t('toggle.family')} />
        <Switch checked={bigText} onChange={setBigText} label={t('size.toggle')} />
        <ThemePicker />
      </Sheet>
    </>
  );
}

/** "Aa" button: toggles larger text. Works on every page (header + welcome page). */
export function TextSizeToggle({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { bigText, setBigText, t } = useApp();
  const light = tone === 'light';
  const on = light ? 'border-white bg-white text-oxblood' : 'border-oxblood bg-oxblood text-on-wine';
  const off = light ? 'border-white/25 bg-white/12 text-white backdrop-blur-md' : 'border-line bg-sand text-ink';
  return (
    <button type="button" aria-pressed={bigText} aria-label={t('size.toggle')} title={t('size.toggle')} onClick={() => setBigText(!bigText)}
      className={`tap inline-flex items-center justify-center rounded-full border px-2.5 font-display leading-none transition-colors ${bigText ? on : off}`}>
      <span aria-hidden="true" className="text-[0.85rem]">A</span><span aria-hidden="true" className="text-[1.2rem]">A</span>
    </button>
  );
}

/** Text-only "EN | हिं" segmented pill. `tone="light"` is for use over photos. */
export function LangToggle({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { lang, setLang, t } = useApp();
  const light = tone === 'light';
  return (
    <div role="group" aria-label={t('lang.toggle')}
      className={`inline-flex items-center rounded-full px-1 ${light ? 'border border-white/25 bg-white/12 text-white backdrop-blur-md' : 'border border-line bg-sand text-ink-2'}`}>
      {([['en', 'EN'], ['hi', 'हिं']] as const).map(([v, label], i) => (
        <span key={v} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className={`h-4 w-px ${light ? 'bg-white/30' : 'bg-line'}`} />}
          <button type="button" lang={v} aria-pressed={lang === v} onClick={() => setLang(v)}
            className="tap flex items-center px-2.5 text-[0.9rem] font-semibold">
            <span className={`border-b-2 pb-0.5 leading-tight ${lang === v ? (light ? 'border-white text-white' : 'border-oxblood text-oxblood') : `border-transparent ${light ? 'text-white/80' : ''}`}`}>{label}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
