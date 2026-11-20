import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Absolute URL is required for WhatsApp/OG previews. Set SITE_URL in your host's env settings.
  const siteUrl = (env.SITE_URL || 'https://rajat-paridhi-wedding.vercel.app').replace(/\/$/, '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'site-url-html',
        transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', siteUrl),
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        manifest: {
          name: 'Rajat & Paridhi — Parinay Samaroh',
          short_name: 'R & P Wedding',
          description: 'Wedding itinerary — 29 Nov to 2 Dec 2026, Indore',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#F7EFE3',
          theme_color: '#6B1A2F',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
          globIgnores: ['images/photos/**', 'og.*', '**/*.woff'],
          runtimeCaching: [
            {
              urlPattern: /\/images\/photos\//,
              handler: 'CacheFirst',
              options: { cacheName: 'photos', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 60 } },
            },
          ],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    build: { target: 'es2020', sourcemap: false },
  };
});
