# 003 — Use the site's ease-out curve on switch toggles

- **Status**: DONE
- **Commit**: 0bf43cf
- **Severity**: LOW
- **Category**: Easing & duration / Cohesion & tokens
- **Estimated scope**: 2 files, 4 class strings

## Problem

The two switch toggles animate with Tailwind's default timing (`cubic-bezier(.4,0,.2,1)`, an ease-in-out) while the rest of the site uses `--ease-out`. The info-page switch also has no explicit duration (150 ms default) while the sheet switch uses 200 ms, so the same control moves differently in two places.

```tsx
// src/components/Toggles.tsx:21-22 — current
<span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-oxblood' : 'bg-ink-2/40'}`}>
  <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
```

```tsx
// src/pages/InfoPage.tsx:125-126 — current
className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${bigText ? 'bg-oxblood' : 'bg-line'}`}>
<span aria-hidden="true" className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${bigText ? 'translate-x-7' : 'translate-x-1'}`} />
```

## Target

Both switches use 200 ms with the site token `--ease-out` (`cubic-bezier(.2,.7,.2,1)`, defined at `src/index.css:24`), via Tailwind v4's `ease-(--ease-out)` utility.

```tsx
// Toggles.tsx:21 track
transition-colors duration-200 ease-(--ease-out)
// Toggles.tsx:22 thumb
transition-transform duration-200 ease-(--ease-out)
// InfoPage.tsx:125 track
transition-colors duration-200 ease-(--ease-out)
// InfoPage.tsx:126 thumb
transition-transform duration-200 ease-(--ease-out)
```

## Repo conventions to follow

- The only easing token is `--ease-out` in `src/index.css:24`; use it, do not hand-type a curve.
- Exemplar of the token in use: `src/components/Sheet.tsx:33` (`animation: 'fade .2s var(--ease-out)'`).

## Steps

1. In `src/components/Toggles.tsx` line 21, change `transition-colors duration-200` to `transition-colors duration-200 ease-(--ease-out)`.
2. In `src/components/Toggles.tsx` line 22, change `transition-transform duration-200` to `transition-transform duration-200 ease-(--ease-out)`.
3. In `src/pages/InfoPage.tsx` line 125, change `transition-colors` to `transition-colors duration-200 ease-(--ease-out)`.
4. In `src/pages/InfoPage.tsx` line 126, change `transition-transform` to `transition-transform duration-200 ease-(--ease-out)`.
5. Run the build and confirm the generated CSS contains the `ease-` utility (search `dist/assets/*.css` for `var(--ease-out)`); if the class did not generate, use `ease-[var(--ease-out)]` instead.

## Boundaries

- Do NOT change sizes, colors, markup, `role`/`aria-*` attributes or click handlers.
- Do NOT touch the "Aa" toggle or the language toggle.
- If the lines no longer match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` passes; `npm run build` succeeds and the built CSS contains `var(--ease-out)` under the new utility.
- **Feel check**: on the Info page, flip "Larger text" repeatedly; then open the side-picker sheet and flip its two switches:
  - The thumb leaves its resting position quickly and settles gently.
  - Both switches move at the same speed.
  - Flipping rapidly mid-transition reverses smoothly without jumping.
  - With reduced motion emulated, the switch still changes state (colour and position) instantly.
- **Done when**: both switches share the same 200 ms `--ease-out` motion.
