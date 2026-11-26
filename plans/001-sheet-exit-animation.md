# 001 — Give bottom sheets an exit animation

- **Status**: DONE
- **Commit**: 0bf43cf
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility
- **Estimated scope**: 2 files (`src/components/Sheet.tsx`, `src/index.css`), ~25 lines

## Problem

Every bottom sheet (side picker, event details, help) slides up over 300 ms on open but vanishes instantly on close, because the component unmounts the moment `open` becomes false. Entering with motion and leaving with none feels lopsided and abrupt.

```tsx
// src/components/Sheet.tsx:31-38 — current
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ animation: 'fade .2s var(--ease-out)' }}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[20px] bg-ivory px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_-12px_rgb(30_20_22/.35)]"
        style={{ animation: 'sheet-up .3s var(--ease-out)' }}>
```

```css
/* src/index.css:50-51 — current keyframes */
@keyframes sheet-up { from { transform: translateY(100%); } to { transform: none; } }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
```

## Target

On close, the panel slides down and the backdrop fades out over 200 ms (faster than the 300 ms entrance, as exits should be) with `var(--ease-out)`, then the sheet unmounts. Focus restore, scroll unlock and the Escape key keep working exactly as now (they already run when `open` flips to false).

```css
/* add to src/index.css next to the existing keyframes */
@keyframes sheet-down { from { transform: none; } to { transform: translateY(100%); } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
```

```tsx
// src/components/Sheet.tsx — target shape
const [mounted, setMounted] = useState(open);
if (open && !mounted) setMounted(true);          // opening: mount immediately
const closing = mounted && !open;

// safety net: if animationend never fires (e.g. tab hidden), unmount anyway
useEffect(() => {
  if (!closing) return;
  const id = setTimeout(() => setMounted(false), 300);
  return () => clearTimeout(id);
}, [closing]);

if (!mounted) return null;
// outer wrapper:  style={{ animation: closing ? 'fade-out .2s var(--ease-out) forwards' : 'fade .2s var(--ease-out)' }}
// panel:          style={{ animation: closing ? 'sheet-down .2s var(--ease-out) forwards' : 'sheet-up .3s var(--ease-out)' }}
//                 onAnimationEnd={(e) => { if (closing && e.animationName === 'sheet-down') setMounted(false); }}
```

## Repo conventions to follow

- Easing token is `--ease-out: cubic-bezier(.2,.7,.2,1)` in `src/index.css:24`. Do not add a new curve.
- Keyframes live in `src/index.css:49-52`; the reduced-motion block at the bottom of that file shortens every animation to .001ms, which still fires `animationend`, so reduced-motion users get an instant close with no extra code.
- The existing effect at `Sheet.tsx:12-29` depends on `open`; leave it untouched.

## Steps

1. In `src/index.css`, add the `sheet-down` and `fade-out` keyframes shown above directly after the `fade` keyframe.
2. In `src/components/Sheet.tsx`, import `useState` alongside `useEffect, useRef`.
3. Add the `mounted` state, `closing` flag and the safety-net effect before the `if (!open) return null;` line, then replace that line with `if (!mounted) return null;`.
4. Make the outer wrapper's and the panel's `style.animation` depend on `closing` as shown, and add the `onAnimationEnd` handler to the panel.
5. While `closing`, make the wrapper ignore input: add `pointer-events-none` to its className when `closing` so a second tap cannot hit the dimming backdrop or a button mid-exit.

## Boundaries

- Do NOT change the focus trap, scroll lock, Escape handling or props of `Sheet`.
- Do NOT touch `src/admin/ui.tsx` (it has its own modal) or any caller of `Sheet`.
- Do NOT add dependencies.
- If `Sheet.tsx` no longer matches the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds.
- **Feel check**: run `npm run dev`, open the side-picker sheet (header pill), then close it by the X button, the backdrop and Escape:
  - The panel slides down while the backdrop fades; nothing snaps.
  - Reopening immediately during the exit starts a fresh entrance with no stuck or invisible sheet.
  - In DevTools Animations panel at 10% speed, the exit visibly starts moving at once (ease-out), not after a pause.
  - With `prefers-reduced-motion: reduce` emulated, the sheet closes instantly and is fully gone.
  - Focus returns to the header pill after closing.
- **Done when**: all three close paths animate, reduced motion closes instantly, and no sheet is left in the DOM afterwards (`document.querySelector('[role=dialog]')` is `null`).
