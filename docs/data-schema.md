# Data schema

Validated at build by `scripts/validate-data.mjs` (Ajv + extra checks). Errors fail the build; warnings do not.

## events.json — array of events
| Field | Type | Notes |
|---|---|---|
| `id` | string `[a-z0-9-]` | unique; used in links (`?e=<id>`) |
| `type` | `ritual` \| `meal` \| `celebration` | meals appear in the compact strip, not as cards |
| `side` | `groom` \| `bride` \| `common` | |
| `city` | `Pune` \| `Indore` \| `TBD` | |
| `venueName` | string \| null | null → "Venue to be announced" |
| `area`, `room` | `{en, hi?}` | optional |
| `title` | `{en, hi?}` | required |
| `time` | `"HH:MM"` 24h \| null | null allowed only if `status:"tbd"` |
| `openEnded` | bool | shows "12:00 onwards"; default length 4 h |
| `durationMin` | int | calendar length; defaults: ritual 90, celebration 120, meal 60 |
| `timeBySide` | `{groom?, bride?}` | per-side override |
| `date` | `YYYY-MM-DD` | must be 29 Nov–2 Dec 2026 (warns otherwise) |
| `dressCode` | `{en, hi?, swatch}` | swatch ∈ lehariya, purple, pastel, indo-western, traditional, any |
| `notes`, `transport` | `{en, hi?}` | transport shows in sheet and on Info page |
| `mapLink` | `https://…` | hides "Open in Maps" if absent |
| `audience` | `all` \| `family` | family hidden by default |
| `status` | `confirmed` \| `tbd` | tbd → italic grey title + "Timing being confirmed" |
| `needsConfirmation` | bool | shows the badge |
| `icon` | string | kumkum, mehendi, pooja, rakhi, carnival, mayra, ring, music, nikasi, travel, meet, garland, phere, reception, meal, tea, info |
| `hiDraft` | bool | Hindi awaiting proofreading |

Days are derived from the distinct `date` values; adding an event on a new date adds a day ribbon column and route automatically.

## contacts.json — array
Family: `{id, kind:"family", side:"groom"|"bride", name, relation?{en,hi}, role:"stay-transport"|"timings", phone, city?, dateRange?{from,to}, placeholder?, primary?, active}`
- `phone`: digits only with country code, no `+` (e.g. `919876543210`). Malformed → build fails.
- Event sheet picks the side's `timings` contact (a contact with matching `city`/`dateRange` wins), else the `primary`, else the first active.
- Help-button / Info page list every active contact for the chosen side(s).
- Remove `"placeholder": true` once a real number is entered.

Venue: `{id, kind:"venue", name{en,hi}, phones:[…], active}` → tap-to-call buttons (numbers are shown).

## meta.json
`lastUpdated` (ISO with offset, shown on the Info page), `announcements[]` (`{id, active, text{en,hi}}`; first active is shown; guests can dismiss, change `id` to re-show), `couple`, `hotel` (address, mapLink, parking, inRoom), `teaCoffee`. The "Last updated" stamp on the Info page is shown in IST in the active language.

## i18n
`src/i18n/en.json`, `hi.json`: flat `key → string`, `{var}` placeholders. Missing Hindi falls back to English (build warns). `t('literal.key')` usages are checked against `en.json` at build.

## photos.config.json (in `/images`) and photos.generated.json
`images/photos.config.json`: `photos[]` of `{slug, source, focal, alt{en,hi}}` (`source` = file in `/images`, `focal` = CSS object-position), `days` (date -> slug), `splash` (slug), `info` (slug). `npm run photos` writes `public/images/photos/<slug>-{640,1280}.webp` and `src/data/photos.generated.json` (paths, focal, alt, aspect, 16px blur placeholder). Never edit the generated JSON by hand.

## Published content (storage and API)
The admin portal publishes one dataset `{events, contacts, meta}` (same shapes as above) that overrides the built-in JSON. Validation: `shared/validate.ts` mirrors `events.schema.json` + `scripts/validate-data.mjs`; `npm run test:admin` fails if the bundled data stops passing it. If you add a field to the schema, update all three.

Upstash Redis keys (never deleted, so history is free):
| Key | Value |
|---|---|
| `site:current` | `{rev, at, content}` — what guests get; `content:null` means "use built-in data" |
| `site:content:<n>` | immutable snapshot of revision n |
| `site:meta:<n>` | `{rev, at, note, kind: save\|reset\|restore}` (History tab shows the last 30) |
| `site:lock:<n>` | publish lock for revision n (30 s TTL) — two simultaneous publishers can't both claim n |
| `site:fails:<ip>` | failed-login counter (15 min TTL; ≥10 = locked out) |

Endpoints (all JSON, `Cache-Control: no-store` except the public one):
| Route | Auth | |
|---|---|---|
| `GET /api/content` | none | `{rev, at, content}`; CDN-cached 10 s; `{rev:0}` if storage isn't configured |
| `POST /api/admin/login` | — | `{username, password}` → `{token, expiresAt}` (24 h HMAC token; username case-insensitive) |
| `GET /api/admin/content` | Bearer | `{rev, at, content, history[]}` |
| `PUT /api/admin/content` | Bearer | `{baseRev, content, note?}` → 422 + `issues[]` if invalid, 409 if `baseRev` is stale; stamps `meta.lastUpdated` |
| `DELETE /api/admin/content` | Bearer | `{baseRev}` → publishes "use built-in data" |
| `POST /api/admin/restore` | Bearer | `{rev}` → re-publishes that snapshot as a new revision |

Env vars: `ADMIN_USER`, `ADMIN_PASS` (required), `ADMIN_SECRET` (optional), `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`.
