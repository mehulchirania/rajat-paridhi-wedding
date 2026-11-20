# How to update details (no coding)

You only ever edit text files in `src/data/` and `src/i18n/`, then save/commit. The website rebuilds itself on Vercel/Cloudflare (see deploy.md). If you make a typo that breaks the format, the build fails with a plain message and the **old site stays live**.

## Change a time or venue
Open `src/data/events.json`. Find the event by its `"title"`. Change `"time": "18:30"` (24-hour clock). For one side only, use `"timeBySide": { "groom": "19:00" }`.

## Mark something "confirmed" or "being confirmed"
`"needsConfirmation": true` shows the yellow badge. Set `false` when final. For events with no venue/time yet use `"status": "tbd"`.

## Add an event
Copy an existing event block, give it a new unique `"id"`, and edit. Required: id, type, side, city, title, date, audience, status, needsConfirmation.

## Hindi text
Edit the `"hi"` value next to the `"en"` one. When family has proofread an event, change `"hiDraft": true` to `false`. Button/label words are in `src/i18n/hi.json`.

## Add the real WhatsApp numbers
`src/data/contacts.json`: replace `"phone"` with country code + number, no spaces/plus (`919876543210`), set the real `"name"`, and delete the line `"placeholder": true`.

## Announcement banner
`src/data/meta.json` → `announcements`: edit the text, set `"active": false` to hide. Changing its `"id"` makes it re-appear for guests who dismissed it.

## "Last updated" stamp
Update `lastUpdated` in `meta.json` (e.g. `"2026-11-25T18:00:00+05:30"`) whenever you publish changes.

## Photos
Replace files in `public/images/gallery/` (same names), or list new files in `meta.json` → `gallery`. Keep photos under ~200 KB (weak wifi).

## Parking / hotel info
`meta.json` → `hotel`.

## Common mistakes
Missing comma between items; straight quotes `"` only; times as `"09:00"` not `"9:00"`. The build message names the file and line.
