# Rajat & Paridhi — Wedding Itinerary (परिणय समारोह)

Mobile-first, bilingual (EN/हिं) static site. Vite + React + TypeScript + Tailwind v4. No backend.
**All content lives in three JSON files + two i18n files. Editing them is enough to update the whole site.**

## Quick start
```bash
npm install
npm run dev        # validates data, then starts Vite
npm run build      # validates data + typecheck + production build -> dist/
npm run preview
npm run assets     # regenerate icons / OG image / placeholders (needs Google Chrome)
npm run qr -- https://your-final-url.com   # writes public/qr.png + public/qr.svg
```
Live URL: https://rajat-paridhi-wedding.vercel.app (default `SITE_URL` in `vite.config.ts`; override with the env var if you add a custom domain). Set `SITE_URL` in your host's environment settings: it is injected into the Open Graph tags (WhatsApp previews need an absolute URL).

## Structure
```
src/data/events.json       all events (+ events.schema.json)
src/data/contacts.json     family WhatsApp contacts + on-site help desk
src/data/meta.json         last-updated stamp, announcements, hotel info, gallery list, family names
src/i18n/en.json hi.json   UI strings
src/lib/                   app context, time (IST), data resolution, contacts, ics
src/components, src/pages  UI
scripts/validate-data.mjs  build-time validation (fails on errors, warns on missing Hindi)
public/images/             placeholders — replace files (keep names, or update meta.json)
docs/                      you are here
```

## Behaviour summary
- **Splash → side picker** (Groom / Bride / Both), stored in localStorage; returning guests skip it ("Replay welcome" in footer).
- **Side views:** Groom = groom + common events; Bride = bride + common; Both = everything, with side badges.
- **Time resolution:** guest side's `timeBySide` override, else `time`. In Both mode the canonical `time` shows plus a "Timing differs by side" badge listing both.
- **Routes:** `/day/29-nov … /day/2-dec`, `/info`, `/gallery`. Event sheets are deep-linkable: `/day/1-dec?e=<event id>`; browser Back closes them. Swipe left/right changes day.
- **IST forced:** event instants are built with an explicit `+05:30` offset, so a wrong device timezone cannot shift anything. Test "now" with `?now=2026-12-01T12:40`.
- **Language:** `?lang=hi|en`, else stored choice, else browser language. `<html lang>` updates dynamically.
- **Family-only events** (`audience:"family"`) are hidden unless "Show family-only events" is ticked.
- **PWA:** installable, all assets precached (works offline).
- **Contacts:** WhatsApp links are built on click; family numbers never appear in the DOM or as `href`s. (They are still inside the JS bundle — this is a static site; it deters casual scraping only.)

## Deviations from the brief (deliberate)
1. `area` and `room` are bilingual `{en,hi}` objects (they contain translatable words like "Lawn", "2nd Floor").
2. Optional fields added: `openEnded` ("12:00 onwards"), `durationMin` (calendar length / now-next), `transport`, `icon`, `hiDraft`. `time` may be `null` when `status:"tbd"`.
3. Mayra & Chak Bhat is two events (one per side) each with its own canonical time (bride 15:30, groom 15:00), so `timeBySide` is not needed there.
4. Groom's Sangeet card is folded into the 19:00 block via `timeBySide.groom:"19:00"` plus a note.
5. Contacts have `role: "stay-transport" | "timings"` (fixed set so event sheets can pick the timings contact) and `primary`.
6. Map links are Google Maps **search** URLs (hotel, Mangal Farm House, Eat & Drive). Replace with exact pins when available.
7. Placeholder family phones are well-formed but undialable (`91000000001x`) so the build passes without risking a message to a stranger. The build prints a warning until `placeholder` is removed.
8. Lighthouse ≥ 90 has **not** been measured in this build environment; run it on the deployed URL (see deploy.md). JS is ~103 kB gzip; Devanagari fonts load only when Hindi glyphs are on screen (the splash always shows one line).

## Hindi proofreading status
Source Hindi from the invitations (Kumkum, Mehendi, Lehariya, Purple, Haldi/Carnival, Chak Bhat, Sagai/Goad, Sangeet, Nikasi, Phere, Reception, dress codes, Tel-Ban, Sankri Rakhi, Ganesh/Mata Pujan/Tel-Haldi) is used as given. Everything else is **draft**: all UI strings in `hi.json` and events with `"hiDraft": true`. `npm run validate` lists the counts. After family proofreading, set `hiDraft` to `false`/remove it.
