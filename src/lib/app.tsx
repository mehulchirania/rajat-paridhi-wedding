import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import type { GuestSide, L10n, Lang } from '../types';
import { store } from './storage';
import { dayNum, formatTime, monthIdx, weekday } from './time';

const dict: Record<Lang, Record<string, string>> = { en, hi };
type Vars = Record<string, string | number>;

interface Ctx {
  lang: Lang; setLang: (l: Lang) => void;
  side: GuestSide; setSide: (s: GuestSide) => void; hasSide: boolean;
  showFamily: boolean; setShowFamily: (v: boolean) => void;
  bigText: boolean; setBigText: (v: boolean) => void;
  splash: boolean; setSplash: (v: boolean) => void;
  t: (key: string, vars?: Vars) => string;
  l: (x?: L10n | { en: string; hi?: string } | null) => string;
  time: (t: string) => string;
  dateLabel: (date: string, withWeekday?: boolean) => string;
}
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'hi' || q === 'en') { store.set('lang', q); return q; }
  } catch { /* ignore */ }
  const saved = store.get('lang');
  if (saved === 'hi' || saved === 'en') return saved;
  return (navigator.language || 'en').toLowerCase().startsWith('hi') ? 'hi' : 'en';
}
const isSide = (v: string | null): v is GuestSide => v === 'groom' || v === 'bride' || v === 'both';

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangS] = useState<Lang>(initialLang);
  const [sideRaw, setSideS] = useState<GuestSide | null>(() => { const s = store.get('side'); return isSide(s) ? s : null; });
  const [showFamily, setFam] = useState(() => store.get('showFamily') === '1');
  const [bigText, setBig] = useState(() => store.get('bigText') === '1');
  const [splash, setSplash] = useState(() => !isSide(store.get('side')));

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { document.documentElement.classList.toggle('big-text', bigText); }, [bigText]);

  const setLang = useCallback((l: Lang) => { store.set('lang', l); setLangS(l); }, []);
  const setSide = useCallback((s: GuestSide) => { store.set('side', s); setSideS(s); }, []);
  const setShowFamily = useCallback((v: boolean) => { store.set('showFamily', v ? '1' : '0'); setFam(v); }, []);
  const setBigText = useCallback((v: boolean) => { store.set('bigText', v ? '1' : '0'); setBig(v); }, []);

  const value = useMemo<Ctx>(() => {
    const t = (key: string, vars?: Vars) => {
      let s = dict[lang][key] || dict.en[key] || key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    };
    const l = (x?: { en: string; hi?: string } | null) => (!x ? '' : lang === 'hi' ? x.hi || x.en : x.en);
    const dateLabel = (date: string, withWeekday = true) =>
      withWeekday
        ? t('date.full', { wd: t(`wd.${weekday(date)}`), d: dayNum(date), mon: t(`mo.${monthIdx(date)}`) })
        : `${dayNum(date)} ${t(`mo.${monthIdx(date)}`)}`;
    return {
      lang, setLang, side: sideRaw ?? 'both', setSide, hasSide: !!sideRaw,
      showFamily, setShowFamily, bigText, setBigText, splash, setSplash,
      t, l, time: (x) => formatTime(x, lang), dateLabel,
    };
  }, [lang, sideRaw, showFamily, bigText, splash, setLang, setSide, setShowFamily, setBigText]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
