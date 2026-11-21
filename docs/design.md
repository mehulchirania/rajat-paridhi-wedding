# Design system — "Ivory & Oxblood" (v2)

Editorial wedding-magazine feel: photography leads, type does the decorating, UI chrome recedes.
Rule of thumb: if an element has both a border **and** a background **and** a shadow, delete two of them.

## What v1 got wrong (do not repeat)
- Every element boxed: cards, chips, toggles, badges all bordered → visual noise.
- Paisley pattern behind body text, maroon slabs, gold borders everywhere → "template wedding site".
- Header + side toggle + lang toggle + 4 day chips + announcement + countdown + now/next all stacked before the first event. First event at ~900px on a phone.
- FAB overlapping cards; bottom nav + FAB + sticky header = three floating layers.
- Cormorant at small sizes looks frail on cheap Android screens.
- Gallery page with placeholders (removed in v2).

## v2.1 changes
- Display font switched from Instrument Serif (too condensed) to Fraunces — wider, softer, still editorial. Times sized down to 1.45rem; agenda gutter 74px, thread at x=79px.
- Header wordmark is a button that replays the welcome; always names (bride-first on Bride's side, both languages).
- Every agenda row with a `mapLink` shows an "Open in Maps" pill under its details.
- Side-specific meals (e.g. groom-side lunch at home) render as agenda rows; only common hotel meals go in the meal strip.
- Day photos: 29 Nov lake, 30 Nov stairs (traditional), 1 Dec fountain walk, 2 Dec traditional walk; Info = garden.

- Welcome page is the `/welcome` route; adds a live countdown (days/hours/mins/secs, tabular Fraunces, champagne labels, hairline dividers) to 1 Dec 00:00 IST, and a "Continue as …" button for returning guests.

- Day hero: the Nikasi chip is replaced by a status chip (Today, with a live dot / Tomorrow / In N days / Completed, IST) and a time-span line (first–last visible event, side-aware). A "What to wear" strip under the hero lists each distinct dress code in order with the time it's first needed (horizontal scroll).

## Principles
1. **Photo-first.** Splash and each day open with a real photo (see `images/photos.config.json`).
2. **One accent per screen.** Oxblood is the brand; groom-blue/bride-pink appear only as small side markers (dot, thin rule, text colour), never fills larger than a pill.
3. **Hairlines, not boxes.** Agenda is a list with 1px `line` separators, not a stack of cards.
4. **Big, legible, elder-friendly.** Body 17px (20.5px in large-text mode; all layout around text uses rem/min-height so it scales), min label 13px, tap targets ≥ 44px, AA contrast everywhere (champagne is decorative only; use `champagne-ink` for text).
5. **Quiet motion.** 200–450ms, `--ease-out`, opacity/translate/scale only. All motion disabled under `prefers-reduced-motion`.

## Tokens
Defined in `src/index.css` `@theme`. Key ones:
| Token | Value | Use |
|---|---|---|
| ivory | #FBF7F1 | page bg (no pattern) |
| sand | #F2EADF | quiet surfaces (meal strip, sheet rows) |
| line | #E6DACB | hairlines |
| ink / ink-2 | #1E1416 / #5A4B47 | text / secondary |
| oxblood | #5E1426 | primary buttons, active states, now-card |
| champagne / champagne-ink | #B8955A / #7A5A22 | ornaments / small caps labels |
| groom / bride | #3A64B0 / #C2416F (+ -soft, -ink) | side markers only |
| wa | #1F7A4D | WhatsApp actions only |

Type
- Display: **Fraunces (variable, optical sizing)** 400 (+ italic) — names, day titles, event titles, times. Hindi display falls to Tiro Devanagari Hindi.
- Body/UI: **Hanken Grotesk** 400/500/600. Hindi falls to Noto Sans Devanagari.
- Scale (rem at 17px root): eyebrow 0.78 uppercase tracking .14em weight 600 · meta 0.9 · body 1 · event title 1.6 · day title 2.6 · splash names 3.4–3.8.
- Times use `font-variant-numeric: tabular-nums lining-nums`.

Radii: cards/sheets 20px (`--radius-card`), pills full. Shadows: only on the floating dock and sheets (`0 10px 30px -12px rgb(30 20 22 / .35)`).

## Screens

### Splash
Full-bleed `splash` photo (object-position = focal), dark gradient scrim bottom 60%.
Top: `॥ जय श्री कृष्ण ॥` (Tiro, champagne, 1.3rem) centred, English transliteration small beneath in italic.
Bottom block on scrim (white text): eyebrow "29 Nov – 2 Dec 2026 · Indore"; names in Fraunces (variable, optical sizing) ~3.6rem — "Rajat" / italic "&" in champagne / "Paridhi" (stacked); "परिणय समारोह" line; then side picker: three equal pill buttons in a row on a frosted pane (`backdrop-blur`, bg white/12, 1px white/25 border): "Groom's side" (small blue dot), "Bride's side" (pink dot), "Both". Hint text below. Lang toggle top-right as a small frosted pill.
Photo fades in (blur placeholder → image), names rise. No knot SVG.

### App shell
- **Compact sticky header (56px, ivory/90 + blur, bottom hairline):** left = brand wordmark in Fraunces (variable, optical sizing) 1.35rem, side-aware ("Paridhi & Rajat" on bride side, "Rajat & Paridhi" otherwise; Hindi: परिणय समारोह). Right = **side pill** (coloured dot + "Bride's side ▾") that opens a small sheet with the 3 options + "Show family-only events" switch + "Larger text" switch; then an **"Aa" button** (aria-pressed; filled oxblood when large text is on; also on the welcome page); then **lang pill** "EN | हिं" (text-only segmented, oxblood underline on active).
- **Day ribbon** (sticky under header on day routes): 4 equal tiles, each = weekday eyebrow + big serif numeral + month; inactive = sand fill + `line` border + ink text; active = filled oxblood with ivory text. Tiles (not bare text) so they read as buttons.
- **Floating dock** replaces bottom nav + FAB: centred rounded container (ivory, border, shadow) with 3 bordered button tiles: Itinerary (cal icon), Info (pin icon), Help (filled green, chat icon). See v2.2 below. Respect safe-area. Page bottom padding ≥ 120px so nothing is hidden behind it.
- Remove: paisley body background, Gallery route/nav/data, A+ header button (moved into side sheet).

### Day page
1. **Day hero** (photo for that date from `photos.generated.json`): 16:10, radius 20, focal crop, bottom scrim; overlay eyebrow "Day 3 · Tuesday", title "1 December" (Hindi: "1 दिसंबर"), meta "6 events · Water Lily Hotel" (count of visible non-meal events; city name if not all at the hotel). On groom/both views before Nikasi, a small frosted chip in the hero top-right: "Nikasi in 11d 9h". Image gently scales 1.04→1 on day change.
2. **Now / Next** (only on event days, IST): single oxblood card, two columns ("Now" | "Up next · in 20 min"), title serif, time + place; trailing "Need help?" text button (white underline). Replaces the old two-slab card.
3. **Announcement:** one-line champagne-ink text with a thin left rule, dismiss ×. No yellow box.
4. **Agenda** (the core): `ol` with a 2px vertical thread in the left gutter (gradient groom→champagne→bride, 40% opacity). Each row = grid `[64px | 1fr]`:
   - Left: time in Fraunces (variable, optical sizing) 1.7rem tabular ("10:00"), meridiem eyebrow under it ("AM"/"सुबह"); "TBA" in ink-2 if no time; small side dot (10px, groom/bride/gradient) sitting on the thread.
   - Right: eyebrow line "Groom's side · Indore" (side word coloured with side-ink; city in ink-2); title Fraunces (variable, optical sizing) 1.6rem; meta "Water Lily Hotel · MIST-1 · Pooja Room, 1st Floor" (ink-2); dress code = 16px swatch + "Dress: Indo-western"; notes (ink-2, 0.9rem); status line(s): "● Timing being confirmed" (amber-ink, amber dot) and in Both mode "Groom 7:00 PM · Bride 6:30 PM" with coloured names.
   - Row is a full-width button; separators are hairlines; tbd rows: title in ink-2 italic.
5. **Meals**: one sand-surface row, three columns (Breakfast 8:00 · Lunch 1:00 · Hi-Tea 4:30), eyebrow "Meals · Shed Area"; tea/coffee line beneath in ink-2. Each column tappable (opens sheet).
6. **Empty state**: centred serif line "Nothing on the Bride's side today" + body + text buttons. No dashed box.
7. Prev/next day as text links "← 30 Nov" / "2 Dec →" at the bottom; swipe kept.

### Event sheet
Ivory sheet, radius 20 top, grab handle. Eyebrow (side · city), title serif 2rem, then definition rows separated by hairlines (When / Where / Dress / Notes / Getting there) with eyebrow labels. Actions: primary oxblood full-width "Add to calendar"; row of two outlined half-width buttons (Maps, Share); WhatsApp button(s) in `wa` green full-width (labelled by side in Both/common). "Timing being confirmed" as amber inline line under When.

### Info page
Hero `info` photo (same style as day hero) titled "Water Lily Hotel". Sections separated by generous space + hairlines, each with eyebrow heading: Address (+ Maps button), In your room, Parking, Tea & coffee, Family contacts (rows: role in serif, name ink-2, green chat icon), On-site help desk (tap-to-call pills, numbers shown), Other venues, Our families (names serif + parents line), Display (Larger text switch, Replay welcome), Last updated stamp.

## Images
Originals live in `/images`. `npm run photos` reads `images/photos.config.json` and writes `public/images/photos/<slug>-{640,1280}.webp` + `src/data/photos.generated.json` (paths, focal, alt, aspect, 16px blur placeholder). Use `<img srcset="…640w, …1280w" sizes="100vw">`, explicit width/height or aspect-ratio, `loading="lazy"` except splash and current day hero (`fetchpriority="high"`), blur placeholder as CSS background until `onLoad`. Photos are runtime-cached by the service worker (CacheFirst), not precached.

## v2.2 — nav affordance + large text
- **Dock** is now a bordered container holding three button tiles (`min-w-[5.25rem]`, rounded-2xl, border, shadow-sm): inactive = sand fill + ink text; active = filled oxblood + ivory; Help = filled green with a white chat chip. Height is content-driven, not fixed.
- **Header controls** (side pill, "Aa", EN/हिं) all carry a `line` border so they read as controls.
- **Large text** fixes: agenda gutter, dot, thread and divider offsets converted from px to rem; header uses `min-h-14` + wrap; saved preference applied pre-paint; "Aa" toggle available on every route.
