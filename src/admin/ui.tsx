import { useEffect, type ReactNode } from 'react';
import type { L10n } from '../types';

export const inputCls = 'block w-full min-h-11 rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-2/50';

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.82rem] font-semibold text-ink-2">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[0.8rem] text-ink-2">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-[0.82rem] font-medium text-bride-ink">{error}</span>}
    </label>
  );
}

export function Text({ value, onChange, ...rest }: { value?: string | null; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <input {...rest} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}
export function Area({ value, onChange, rows = 3, lang }: { value?: string; onChange: (v: string) => void; rows?: number; lang?: string }) {
  return <textarea lang={lang} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${inputCls} leading-snug`} />;
}
export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: readonly (T | { v: T; label: string })[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={inputCls}>
      {options.map((o) => { const v = typeof o === 'string' ? o : o.v; return <option key={v} value={v}>{typeof o === 'string' ? o : o.label}</option>; })}
    </select>
  );
}
export function Check({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 accent-oxblood" />
      <span><span className="block text-base text-ink">{label}</span>{hint && <span className="block text-[0.8rem] text-ink-2">{hint}</span>}</span>
    </label>
  );
}

type Kind = 'primary' | 'ghost' | 'danger';
export function Btn({ kind = 'ghost', small, className = '', ...rest }: { kind?: Kind; small?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed';
  const size = small ? 'min-h-10 px-4 text-[0.9rem]' : 'min-h-12 px-6 text-base';
  const tone = kind === 'primary' ? 'bg-oxblood text-white' : kind === 'danger' ? 'border border-bride text-bride-ink bg-paper' : 'border border-line bg-paper text-ink';
  return <button type="button" {...rest} className={`${base} ${size} ${tone} ${className}`} />;
}

/** English + Hindi pair. Optional fields collapse to `undefined` when both are empty. */
export function L10nInput({ label, value, onChange, required, multiline, error }: {
  label: string; value?: L10n; onChange: (v: L10n | undefined) => void; required?: boolean; multiline?: boolean; error?: string;
}) {
  const en = value?.en ?? '', hi = value?.hi ?? '';
  const emit = (e: string, h: string) => onChange(!required && !e && !h ? undefined : { en: e, ...(h ? { hi: h } : {}) });
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-[0.82rem] font-semibold text-ink-2">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {multiline
          ? <><Area value={en} onChange={(v) => emit(v, hi)} /><Area lang="hi" value={hi} onChange={(v) => emit(en, v)} /></>
          : <><Text aria-label={`${label} (English)`} placeholder="English" value={en} onChange={(v) => emit(v, hi)} /><Text lang="hi" aria-label={`${label} (Hindi)`} placeholder="हिन्दी" value={hi} onChange={(v) => emit(en, v)} /></>}
      </div>
      {error && <p role="alert" className="text-[0.82rem] font-medium text-bride-ink">{error}</p>}
    </fieldset>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = o; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[20px] bg-ivory p-5 sm:rounded-[20px]">
        <h2 className="mb-3 font-display text-[1.7rem] leading-tight">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-[20px] border border-line bg-paper p-4 ${className}`}>{children}</section>
);

export const PageHead = ({ title, sub }: { title: string; sub?: string }) => (
  <div>
    <h2 className="font-display text-[1.75rem] leading-tight">{title}</h2>
    {sub && <p className="mt-1 text-[0.92rem] text-ink-2">{sub}</p>}
  </div>
);

// ---- small helpers shared by the tabs ----
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
export const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
export const clean = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
export const dateLabel = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
export const time12 = (t?: string | null) => {
  if (!t) return 'TBD';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
export const istStamp = (iso: string | null) => (iso ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '—');
