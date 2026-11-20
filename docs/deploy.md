# Deploy

## Vercel (recommended)
1. Push this folder to a Git repo. Import in Vercel (framework: Vite; build `npm run build`; output `dist`).
2. Environment variable: `SITE_URL=https://<your-domain>` (needed for WhatsApp preview image).
3. `vercel.json` already rewrites unknown paths to `index.html` (so `/day/1-dec` works on refresh).

## Cloudflare Pages
Build `npm run build`, output `dist`, env `SITE_URL`. `public/_redirects` provides the SPA fallback.

## After deploying
1. `npm run qr -- https://<final-url>` then commit `public/qr.png|svg` (print on cards).
2. Open the URL on a phone, "Add to Home Screen", toggle airplane mode: itinerary should still load.
3. Lighthouse (Chrome DevTools → Mobile) should be ≥ 90; if not, check image sizes first.
4. Paste the link into WhatsApp to confirm the preview (clear WhatsApp's cache by adding `?v=2` if you change OG image).
5. Before launch: replace placeholder phones, exact map pins, parking info; proofread Hindi; update `lastUpdated`.

## Service-worker note
The PWA auto-updates: guests get new content on their next online visit (may need one reload).
