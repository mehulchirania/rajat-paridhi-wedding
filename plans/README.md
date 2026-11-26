# Animation plans

Written against commit `0bf43cf`. Each plan is self-contained and can be run by any agent.

| # | Title | Severity | Status |
|---|---|---|---|
| 001 | [Give bottom sheets an exit animation](001-sheet-exit-animation.md) | MEDIUM | DONE |
| 002 | [Remove the 450 ms wait on the splash Continue button](002-splash-continue-no-delay.md) | MEDIUM | DONE |
| 003 | [Use the site's ease-out curve on switch toggles](003-switch-ease-out.md) | LOW | DONE |

## Execution order

1. **002** — smallest and most noticeable for returning guests (one file).
2. **001** — touches `Sheet.tsx` and `index.css`.
3. **003** — independent class-string swap; run last.

## Dependencies

None. The plans touch different files (003 does not touch `Sheet.tsx`; 001 and 003 never overlap), so they can run in any order, but run them one at a time to keep diffs reviewable.

## Not planned yet (missed opportunities)

- Press feedback (`scale(.97)` on `:active`) for header pills, day chips and agenda rows.
- Drag-down to dismiss sheets.
- A short crossfade when the Now/Next card changes state.
