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
| `status` | `confirmed` \| `tbd` | tbd → dashed card + "Timing being confirmed" |
| `needsConfirmation` | bool | shows the badge |
| `icon` | string | kumkum, mehendi, pooja, rakhi, carnival, mayra, ring, music, nikasi, meet, garland, phere, reception, meal, tea, info |
| `hiDraft` | bool | Hindi awaiting proofreading |

Days are derived from the distinct `date` values; adding an event on a new date adds a day chip and route automatically.

## contacts.json — array
Family: `{id, kind:"family", side:"groom"|"bride", name, relation?{en,hi}, role:"stay-transport"|"timings", phone, city?, dateRange?{from,to}, placeholder?, primary?, active}`
- `phone`: digits only with country code, no `+` (e.g. `919876543210`). Malformed → build fails.
- Event sheet picks the side's `timings` contact (a contact with matching `city`/`dateRange` wins), else the `primary`, else the first active.
- Help-button / Info page list every active contact for the chosen side(s).
- Remove `"placeholder": true` once a real number is entered.

Venue: `{id, kind:"venue", name{en,hi}, phones:[…], active}` → tap-to-call buttons (numbers are shown).

## meta.json
`lastUpdated` (ISO with offset, shown in footer), `announcements[]` (`{id, active, text{en,hi}}`; first active is shown; guests can dismiss, change `id` to re-show), `couple`, `hotel` (address, mapLink, parking, inRoom), `teaCoffee`, `gallery[]` (`{src, alt{en,hi}}`).

## i18n
`src/i18n/en.json`, `hi.json`: flat `key → string`, `{var}` placeholders. Missing Hindi falls back to English (build warns). `t('literal.key')` usages are checked against `en.json` at build.
