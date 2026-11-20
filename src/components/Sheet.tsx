import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../lib/app';
import { Icon } from './Icons';

/** Accessible modal bottom sheet: Esc closes, focus is trapped and restored, body scroll locked. */
export function Sheet({ open, onClose, title, children, titleId }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; titleId: string }) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ animation: 'fade .2s ease-out' }}>
      <div className="absolute inset-0 bg-maroon-deep/55" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t-4 border-gold bg-paper p-5 pb-8 shadow-2xl"
        style={{ animation: 'sheet-up .28s ease-out' }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-[1.65rem] font-bold leading-tight text-maroon">{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label={t('sheet.close')} className="tap -mr-2 -mt-1 inline-flex items-center justify-center rounded-full text-maroon hover:bg-cream">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
