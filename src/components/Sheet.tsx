import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../lib/app';
import { Icon } from './Icons';

/** Drag past this many px (or flick fast) to dismiss. */
const DISMISS_PX = 110;

/** Accessible modal bottom sheet: Esc closes, focus is trapped and restored, body scroll locked.
 *  Slides down on close and can be dragged down by its handle. */
export function Sheet({ open, onClose, title, children, titleId, eyebrow }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; titleId: string; eyebrow?: ReactNode }) {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  // Stay mounted while the exit animation plays.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  const closing = mounted && !open;
  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(() => setMounted(false), 350); // safety net if animationend never fires
    return () => clearTimeout(id);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [open]);

  // Drag-down-to-dismiss, on the grab handle only (so buttons and scrolling inside the sheet are untouched).
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null);
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (closing || (e.pointerType === 'mouse' && e.button !== 0)) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone: drag still works while it stays over the handle */ }
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    if (ref.current) ref.current.style.transition = 'none';
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !ref.current) return;
    d.dy = Math.max(0, e.clientY - d.y);
    ref.current.style.transform = `translateY(${d.dy}px)`;
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const d = drag.current;
    drag.current = null;
    const panel = ref.current;
    if (!d || !panel) return;
    try { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const speed = d.dy / Math.max(1, performance.now() - d.t); // px per ms
    if (!cancelled && (d.dy > DISMISS_PX || (d.dy > 30 && speed > 0.6))) {
      panel.style.setProperty('--drag', `${d.dy}px`); // exit animation continues from where the finger left it
      onCloseRef.current();
    } else {
      panel.style.transition = 'transform .25s var(--ease-out)';
      panel.style.transform = '';
    }
  };

  if (!mounted) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-end justify-center ${closing ? 'pointer-events-none' : ''}`}
      style={{ animation: closing ? 'fade-out .2s var(--ease-out) forwards' : 'fade .2s var(--ease-out)' }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[20px] bg-ivory px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_-12px_rgb(30_20_22/.35)]"
        style={{ animation: closing ? 'sheet-down .2s var(--ease-out) forwards' : 'sheet-up .3s var(--ease-out)' }}
        onAnimationEnd={(e) => { if (closing && e.animationName === 'sheet-down') setMounted(false); }}>
        <div aria-hidden="true" className="-mx-5 -mt-2.5 mb-1 flex h-9 cursor-grab touch-none justify-center pt-3.5 active:cursor-grabbing"
          onPointerDown={down} onPointerMove={move} onPointerUp={(e) => up(e)} onPointerCancel={(e) => up(e, true)}>
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>
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
