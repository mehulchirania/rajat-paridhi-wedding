# Admin portal (`/admin`)

Edit the live site from your phone — no code, no redeploy. Open `https://<your-site>/admin`, sign in, change things, **Review & publish**. Not linked from the guest site, marked `noindex`, and code-split (guests never download it).

## One-time setup (Vercel dashboard — about 5 minutes)
1. **Storage:** Vercel project → *Storage* → *Create / Connect* → **Upstash Redis** (free plan is plenty) → connect it to this project (all environments). Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically (`UPSTASH_REDIS_REST_URL/TOKEN` also work).
2. **Login:** project → *Settings → Environment Variables* → add `ADMIN_USER` and `ADMIN_PASS` (the credentials you want). Optional: `ADMIN_SECRET` (any long random string; signs login tokens — if unset it is derived from the username + password, so changing the password signs everyone out).
3. **Redeploy** (Deployments → ⋯ → Redeploy). Env vars only apply to new deployments.
4. Open `/admin`, sign in. Until something is published the site shows the data that ships in the repo.

Until step 1–2 are done `/admin` shows "not configured" and the guest site is unaffected.

### Credentials — read this
The username/password are **not** in the code (the repo is public). They live only in Vercel env vars, so changing them never needs a code change. `rajat` / `paridhi` are the two names printed on the site: any guest can guess them. Anyone who signs in can change every event, notice and phone number. Mitigations built in: 10 wrong attempts per IP → 15-minute lockout, every publish is kept in History with one-click restore, and publishing is blocked if two people edit at once. **Strongly recommended:** set a password that isn't a name on the site (e.g. `ADMIN_PASS=Paridhi!Rajat-29Nov`); sessions last 24 hours.

## What you can edit
| Tab | What it covers |
|---|---|
| **Events** | Add / duplicate / delete events. Title, date, time, per-side times, "timing being confirmed", TBD, open-ended, venue, area/room, city, side, type, icon, Google Maps link, dress code, notes, transport, family-only, length, Hindi (every text field has English + हिन्दी). |
| **Notices** | The banner on every day page ("Baraat running 1 hour late"). First active notice shows; reorder, switch off, or *Show again to everyone* (re-shows to guests who dismissed it). |
| **Shift times** | "Everything from 2 PM on 1 Dec is 45 min late" in one step: pick day / side / from-time / minutes, preview, apply. Optionally flags those events "timing being confirmed". |
| **Contacts** | Family WhatsApp numbers (warns while placeholders remain), roles, active/primary; on-site help-desk phone numbers. |
| **Venue & names** | Hotel name/address/map link, parking, in-room help, tea/coffee line, couple and parents' names. |
| **History** | Every publish with time and note; restore any version (re-published as a *new* version); download a JSON backup; reset to the built-in repo data. |
| **Advanced** | Raw JSON for anything the forms don't cover (same validation). |

Not editable here: photos and UI button/label wording (`src/i18n/*`) — those still need a code change + deploy.

## Publishing, safely
- Edits stay in a **draft** in your browser until you press **Review & publish**; the review lists exactly what changed. **Discard** drops the draft.
- **Validation:** the server re-checks everything (same rules as the build). Invalid data is refused with the field named, so a typo can never break the live site. Guests' phones also refuse to apply content that fails validation.
- **Last updated** on the Info page is stamped automatically (IST) on every publish.
- **When guests see it:** new visits within ~10–60 s; a guest with the app open picks it up on returning to the app, when the network returns, or within 3 minutes. The page re-renders in place (no reload).
- **Offline:** guests keep the last content they received, then built-in data if they never got any.
- **Two editors at once:** the second publish is refused ("someone else published") and you can discard and reload. Nothing is overwritten.

## After you start using it
Once you publish from the portal, **the portal is the source of truth**: later edits to `src/data/*.json` in git won't show until you *Reset to built-in data*. Download a backup (History tab) now and then; the JSON can be pasted back into the `src/data` files if you ever want the repo to match.

## Local development
```bash
npm run dev:api   # terminal 1: runs the /api handlers against in-memory storage (login rajat / paridhi)
npm run dev       # terminal 2: Vite proxies /api to it; open http://localhost:5173/admin
npm run test:admin  # 18 API tests (auth, lockout, validation, publish/conflict/restore/reset, race)
```
`npm run dev:api` forgets everything on restart. To exercise the real functions use `vercel dev` with the env vars above.

## How it works
`api/` (Vercel Functions): `content` (public, latest published data), `admin/login`, `admin/content` (GET state+history, PUT publish, DELETE reset), `admin/restore`. Login issues an HMAC-signed 24-hour bearer token (no cookies, so no CSRF). Validation lives in `shared/validate.ts` and is used by the API, the admin forms, and the guest app. See [data-schema.md](data-schema.md#published-content-storage-and-api) for storage layout.
