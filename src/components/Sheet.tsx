import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../lib/app';
import { Icon } from './Icons';

/** Accessible modal bottom sheet: Esc closes, focus is trapped and restored, body scroll locked. */
export function Sheet({ open, onClose, title, children, titleId, eyebrow }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; titleId: string; eyebrow?: ReactNode }) {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ animation: 'fade .2s var(--ease-out)' }}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[20px] bg-ivory px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_-12px_rgb(30_20_22/.35)]"
        style={{ animation: 'sheet-up .3s var(--ease-out)' }}>
        <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink-2">{eyebrow}</p>}
            <h2 id={titleId} className="font-display text-[2rem] font-normal leading-[1.1] text-ink">{title}</h2>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label={t('sheet.close')} className="tap -mr-2 -mt-1 inline-flex shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-sand">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
