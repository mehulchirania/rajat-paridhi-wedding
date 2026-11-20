# Deploy

Live: https://rajat-paridhi-wedding.vercel.app · Repo: github.com/mehulchirania/rajat-paridhi-wedding · **Pushing to `main` auto-deploys on Vercel.**

## Vercel (recommended)
1. Push this folder to a Git repo. Import in Vercel (framework: Vite; build `npm run build`; output `dist`).
2. Environment variable: `SITE_URL=https://<your-domain>` (needed for WhatsApp preview image).
3. `vercel.json` already rewrites unknown paths to `index.html` (so `/day/1-dec` works on refresh).

## Cloudflare Pages
Build `npm run build`, output `dist`, env `SITE_URL`. `public/_redirects` provides the SPA fallback.

## After deploying
1. `npm run qr -- https://<final-url>` then commit `public/qr.png|svg` (print on cards).
2. Open the URL on a phone, "Add to Home Screen", toggle airplane mode: itinerary should still load.
3. Lighthouse (Chrome DevTools → Mobile) should be ≥ 90; if not, check image sizes first (run `npm run photos`).
4. Paste the link into WhatsApp to confirm the preview (clear WhatsApp's cache by adding `?v=2` if you change OG image).
5. Before launch: replace placeholder phones, exact map pins, parking info; proofread Hindi; update `lastUpdated`.

## Service-worker note
The PWA auto-updates: guests get new content on their next online visit (may need one reload). The app shell is precached; photos in `/images/photos` are runtime-cached (CacheFirst) the first time each is viewed, so they work offline only after being seen once. If a replaced photo still shows the old picture on a device, give it a new slug in `images/photos.config.json` so it gets a new file name.

## Analytics
Vercel Web Analytics (`@vercel/analytics`) is mounted once in `src/App.tsx` (`<Analytics />`, outside the splash/routes switch so the splash is counted). Enable it in Vercel → Project → Analytics; it only reports on Vercel deployments. `/_vercel/*` is excluded from the SPA rewrite in `vercel.json` and from the service worker's `navigateFallback` (`vite.config.ts`) so the beacon requests reach Vercel. No cookies; no personal data collected.
