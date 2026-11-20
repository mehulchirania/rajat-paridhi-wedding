# How to update details (no coding)

You only ever edit text files in `src/data/` and `src/i18n/`, then save/commit. The website rebuilds itself on Vercel/Cloudflare (see deploy.md). If you make a typo that breaks the format, the build fails with a plain message and the **old site stays live**.

## Change a time or venue
Open `src/data/events.json`. Find the event by its `"title"`. Change `"time": "18:30"` (24-hour clock). For one side only, use `"timeBySide": { "groom": "19:00" }`.

## Mark something "confirmed" or "being confirmed"
`"needsConfirmation": true` shows the amber "Timing being confirmed" line. Set `false` when final. For events with no venue/time yet use `"status": "tbd"`.

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

## Change a photo
The site uses six photos: the welcome screen, one for each of the four days, and the Info page. Your original pictures live in the `images` folder.
1. Put the new picture (a JPG or PNG, any size) into the `images` folder.
2. Open `images/photos.config.json`. Find the photo you want to replace (for example `splash-pergola` is the welcome screen, `info-garden` is the Info page). Change the file name after `"source":` to your new picture's file name, exactly as it is spelled, including spaces.
3. Optional: `"focal"` says which part of the picture stays visible when it is cropped, as two percentages (left-to-right, top-to-bottom). `"50% 30%"` keeps the upper middle (good for faces); `"50% 50%"` is the centre. `"alt"` is the short English/Hindi description read aloud to people who cannot see the picture.
4. Run `npm run photos` (a developer can do this, or ask for help). It shrinks the pictures for fast loading and updates the site files.
5. Save/commit and push. The site updates by itself in a minute or two.
Tip: portrait or square photos with the people near the middle work best. Never put the big original files in `public/`; only `images/` is for originals.

## Parking / hotel info
`meta.json` → `hotel`.

## Common mistakes
Missing comma between items; straight quotes `"` only; times as `"09:00"` not `"9:00"`. The build message names the file and line.
