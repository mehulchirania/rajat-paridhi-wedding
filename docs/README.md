# Rajat & Paridhi — Wedding Itinerary (परिणय समारोह)

Mobile-first, bilingual (EN/हिं) site. Vite + React + TypeScript + Tailwind v4, plus a small serverless API (Vercel Functions + Upstash Redis) that powers the **`/admin` portal**.
**Content starts as three JSON files + two i18n files in the repo (built-in data). The admin portal can override the three JSON datasets live, without a redeploy — see [admin.md](admin.md).**

## Quick start
Windows: double-click `start-dev.cmd` in the project folder (installs once, then opens http://localhost:5173).

```bash
npm install
npm run dev        # validates data, then starts Vite
npm run build      # validates data + typecheck + production build -> dist/
npm run preview
npm run photos     # optimise originals in /images -> public/images/photos + src/data/photos.generated.json
npm run assets     # regenerate icons + OG image (needs Google Chrome)
npm run qr -- https://your-final-url.com   # writes public/qr.png + public/qr.svg
npm run dev:api    # local in-memory /api for trying /admin (login rajat / paridhi)
npm run test:admin # API tests: auth, lockout, validation, publish/conflict/restore/reset
```
Live URL: https://rajat-paridhi-wedding.vercel.app (default `SITE_URL` in `vite.config.ts`; override with the env var if you add a custom domain). Set `SITE_URL` in your host's environment settings: it is injected into the Open Graph tags (WhatsApp previews need an absolute URL).

## Structure
```
api/                       Vercel Functions: public content, admin login/content/restore (api/_lib = redis, auth, store)
shared/validate.ts         runtime validator used by the API, the admin forms and the guest app
src/admin/                 /admin portal UI (code-split; AdminApp.tsx + one file per tab)
src/lib/content.ts         fetch/cache/apply of published content on the guest site
src/data/events.json       all events (+ events.schema.json) — built-in data

src/data/contacts.json     family WhatsApp contacts + on-site help desk
src/data/meta.json         last-updated stamp, announcements, hotel info, family names
src/data/photos.generated.json  written by `npm run photos` (do not edit by hand)
images/                    original photos + photos.config.json (slug, source file, focal point, alt text)
src/i18n/en.json hi.json   UI strings
src/lib/                   app context, time (IST), data resolution, contacts, ics
src/components, src/pages  UI
scripts/validate-data.mjs  build-time validation (fails on errors, warns on missing Hindi)
scripts/test-admin.ts      API integration tests (fake Redis); scripts/dev-api.ts local API
public/images/photos/      generated WebP photos (640w + 1280w)
docs/                      you are here (design.md = visual spec)
```

## UI structure (v2 "Ivory & Oxblood")
Full visual spec: [design.md](design.md). In short:
- **Fonts:** Fraunces (variable, optical sizing) (display), Hanken Grotesk (body), Noto Sans Devanagari (Hindi body), Tiro Devanagari Hindi (Hindi display).
- **Compact header** with brand wordmark, a **side pill** and an EN/हिं switch. The side pill opens a **side sheet** with the three side options plus the *Show family-only events* and *Larger text* switches.
- **Day ribbon** (4 days) under the header, a photo **day hero**, a list-style agenda, and a **floating dock** with Itinerary, Info and Help (WhatsApp).
- **Event sheet** (tap any event): when / where / dress / notes / getting there, Add to calendar, Maps, Share and WhatsApp buttons.
- **Info page:** hotel photo hero, address, in-room, parking, tea & coffee, family contacts, on-site help desk, other venues, families, display settings.

## Behaviour summary
- **Live content:** on load the app uses the cached last-published content (localStorage) or the built-in JSON, then fetches `/api/content` (no-cache). A newer revision is validated, cached, applied and the guest UI re-mounts in place (`ContentGate` in `main.tsx`; `lib/data.ts` exports live bindings, `lib/contacts.ts` exports functions). It re-checks when the app returns to the foreground, on `online`, and every 3 min. `/admin` renders outside that tree so a refresh can never wipe an edit in progress. If storage isn't configured the API returns `{rev:0, content:null}` and the site simply uses the built-in data.
- **Welcome page is a real route: `/welcome`.** First-time visitors are sent there, then returned to the page they opened. Tapping the names in the header, or "Replay welcome", opens it; browser Back returns to where you were. Returning guests see "Continue as <side>" plus the side picker.
- **Countdown** on the welcome page to the main celebrations (1 Dec 2026, 00:00 IST); it disappears at that moment. Test with `/welcome?now=2026-11-30T23:59`.
- **Updates:** the service worker checks for a new deploy on load, whenever the app returns to the foreground, and hourly, then reloads to the new version.
- **Splash → side picker** (Groom / Bride / Both), stored in localStorage; returning guests skip it ("Replay welcome" on the Info page).
- **Side views:** Groom = groom + common events; Bride = bride + common; Both = everything, with side badges.
- **Time resolution:** guest side's `timeBySide` override, else `time`. In Both mode the canonical `time` shows plus a "Timing differs by side" badge listing both.
- **Routes:** `/day/29-nov … /day/2-dec`, `/info`. Event sheets are deep-linkable: `/day/1-dec?e=<event id>`; browser Back closes them. Swipe left/right changes day.
- **IST forced:** event instants are built with an explicit `+05:30` offset, so a wrong device timezone cannot shift anything. Test "now" with `?now=2026-12-01T12:40`.
- **Language:** `?lang=hi|en`, else stored choice, else browser language. `<html lang>` updates dynamically.
- **Family-only events** (`audience:"family"`) are hidden unless "Show family-only events" is ticked.
- **PWA:** installable; app shell and data are precached (works offline). Photos are runtime-cached by the service worker (CacheFirst) after first view, not precached.
- **Contacts:** WhatsApp links are built on click; family numbers never appear in the DOM or as `href`s. (They are still inside the JS bundle and the public `/api/content` response — it deters casual scraping only.)

## Deviations from the brief (deliberate)
1. `area` and `room` are bilingual `{en,hi}` objects (they contain translatable words like "Lawn", "2nd Floor").
2. Optional fields added: `openEnded` ("12:00 onwards"), `durationMin` (calendar length / now-next), `transport`, `icon`, `hiDraft`. `time` may be `null` when `status:"tbd"`.
3. Mayra & Chak Bhat is two events (one per side) each with its own canonical time (bride 15:30, groom 15:00), so `timeBySide` is not needed there.
4. Groom's Sangeet card is folded into the 19:00 block via `timeBySide.groom:"19:00"` plus a note.
5. Contacts have `role: "stay-transport" | "timings"` (fixed set so event sheets can pick the timings contact) and `primary`.
6. Map links are Google Maps **search** URLs (hotel, Mangal Farm House, Eat & Drive). Replace with exact pins when available.
7. Placeholder family phones are well-formed but undialable (`91000000001x`) so the build passes without risking a message to a stranger. The build prints a warning until `placeholder` is removed.
8. Lighthouse ≥ 90 has **not** been measured in this build environment; run it on the deployed URL (see deploy.md). Devanagari fonts load only when Hindi glyphs are on screen (the splash always shows one line).

## Hindi proofreading status
Source Hindi from the invitations (Kumkum, Mehendi, Lehariya, Purple, Haldi/Carnival, Chak Bhat, Sagai/Goad, Sangeet, Nikasi, Phere, Reception, dress codes, Tel-Ban, Sankri Rakhi, Ganesh/Mata Pujan/Tel-Haldi) is used as given. Everything else is **draft**: all UI strings in `hi.json` and events with `"hiDraft": true`. `npm run validate` lists the counts. After family proofreading, set `hiDraft` to `false`/remove it.
