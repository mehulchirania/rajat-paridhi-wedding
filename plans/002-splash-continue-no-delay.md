# 002 — Remove the 450 ms wait on the splash "Continue" button

- **Status**: DONE
- **Commit**: 0bf43cf
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 1–2 files (`src/components/Splash.tsx`, possibly `src/components/MusicToggle.tsx`), ~10 lines

## Problem

Returning guests tap "Continue as …" every time they reopen the app, and each tap waits 450 ms (petal burst plus a timer) before navigating. The burst is a nice first-time moment but turns into a repeated delay on a frequent, purely navigational action.

```tsx
// src/components/Splash.tsx:32-41 — current
  const pick = (s: GuestSide, e: MouseEvent<HTMLElement>) => {
    if (timer.current) return; // already leaving
    const go = () => { setSide(s); nav(target, { replace: !from }); };
    music.current?.fadeOutAndStop(800);
    if (prefersReducedMotion()) { go(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    try { navigator.vibrate?.(15); } catch { /* unsupported */ }
    timer.current = setTimeout(go, 450);
  };
```

```tsx
// src/components/Splash.tsx:70-71 — the Continue button calls the same function
        {hasSide && (
          <button type="button" onClick={(e) => pick(side, e)} style={rise(550)}
```

## Target

- The **Continue** button navigates immediately (0 ms delay, no petal burst). The three side-picker buttons keep today's 450 ms burst, since choosing a side for the first time is the moment the petals celebrate.
- The welcome music still fades out over 800 ms.

```tsx
// target
const pick = (s: GuestSide, e: MouseEvent<HTMLElement>, instant = false) => {
  if (timer.current) return;
  const go = () => { setSide(s); nav(target, { replace: !from }); };
  music.current?.fadeOutAndStop(800);
  if (instant || prefersReducedMotion()) { go(); return; }
  ...unchanged...
};
// Continue button: onClick={(e) => pick(side, e, true)}
```

## Repo conventions to follow

- `prefersReducedMotion()` from `src/lib/motion.ts` already gates the delay; reuse that early-return shape.
- Do not change the burst timing (450 ms) used by the three side buttons.

## Steps

1. Open `src/components/MusicToggle.tsx` and read `fadeOutAndStop`. Verified: the fade is detached from React (MusicToggle.tsx, "Detached from React"), so it keeps running after navigation; no delay needed. (Original check: whether the 800 ms fade keeps running after `Splash` unmounts (e.g. it is driven by a module-level timer or audio element rather than component state or effects). Note the answer.
2. In `Splash.tsx`, add the `instant = false` third parameter to `pick` and change the reduced-motion check to `if (instant || prefersReducedMotion())`.
3. Change only the Continue button's handler to `onClick={(e) => pick(side, e, true)}`.
4. If step 1 shows the fade is cancelled on unmount, instead keep a short `setTimeout(go, 120)` for `instant` picks (not 0) so the fade is audible, and report that choice in your summary.

## Boundaries

- Do NOT touch the side-picker buttons' behaviour, the petal burst or the 450 ms timer.
- Do NOT change `MusicToggle.tsx` beyond reading it, unless step 4 forces nothing else.
- If `Splash.tsx` no longer matches the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds.
- **Feel check**: with a side already chosen, open `/welcome`:
  - Tapping Continue lands on the day page with no visible pause or petals.
  - Tapping "Groom's side", "Bride's side" or "Both" still shows the petal burst and the 450 ms exit.
  - If music was playing, it fades out over the next ~800 ms after navigation (or is stopped cleanly if step 4 applied); it never keeps playing on the day page.
  - Double-tapping Continue does not navigate twice (back button goes to the previous page once).
- **Done when**: Continue is instant, side buttons are unchanged, and no welcome music leaks into the app shell.
