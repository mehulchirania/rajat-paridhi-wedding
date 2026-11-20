// Generates icons, favicon and the OG image.
// Dev-only helper (needs Google Chrome for OG/icon rendering). Outputs are committed in /public.
// Re-run:  npm run assets
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = (p) => path.join(root, 'public', p);

const mono = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#5E1426"/><text x="32" y="43" text-anchor="middle" font-family="'Instrument Serif',Georgia,serif" font-size="34" fill="#FBF7F1">R<tspan fill="#B8955A" font-style="italic">&amp;</tspan>P</text></svg>`;
fs.writeFileSync(pub('favicon.svg'), mono);

// Chrome render (fonts from node_modules so Devanagari + serif display are correct)
const f = (pkg, file) => `file://${root}/node_modules/@fontsource/${pkg}/files/${file}`;
const fonts = `
@font-face{font-family:CG;font-weight:100 900;src:url(file://${root}/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2)}
@font-face{font-family:CG;font-weight:100 900;font-style:italic;src:url(file://${root}/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2)}
@font-face{font-family:TD;src:url(${f('tiro-devanagari-hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2')})}`;
const tmp = fs.mkdtempSync('/tmp/wedassets-');
const shot = (html, out, w, h) => {
  const file = path.join(tmp, 'p.html');
  fs.writeFileSync(file, html);
  execFileSync('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--window-size=${w},${h}`, `--screenshot=${out}`, `file://${file}`], { stdio: 'ignore' });
};
// OG image: splash photo full-bleed + scrim + title block (see docs/design.md)
const gen = JSON.parse(fs.readFileSync(path.join(root, 'src/data/photos.generated.json'), 'utf8'));
const splashSlug = gen.splash;
const splashFocal = gen.photos[splashSlug]?.focal ?? '50% 45%';
const splashImg = `file://${root}/public/images/photos/${splashSlug}-1280.webp`;
const ogFonts = `@font-face{font-family:IS;font-weight:100 900;src:url(file://${root}/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2)}
@font-face{font-family:IS;font-weight:100 900;font-style:italic;src:url(file://${root}/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2)}`;
shot(`<style>${fonts}${ogFonts}
body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;background:#1E1416;color:#fff;font-family:IS,TD,serif}
.bg{position:absolute;top:0;bottom:0;right:0;left:300px;background:url(${splashImg}) ${splashFocal}/cover no-repeat}
.sc{position:absolute;inset:0;background:linear-gradient(90deg,#1E1416 0,#1E1416 330px,rgba(30,20,22,.7) 460px,rgba(30,20,22,.25) 600px,rgba(30,20,22,0) 760px),linear-gradient(0deg,rgba(30,20,22,.6),transparent 40%)}
.t{position:absolute;left:72px;bottom:64px;display:flex;flex-direction:column;align-items:flex-start}
.h{font-family:TD;font-size:34px;color:#D9B77A;letter-spacing:1px}
.n{font-size:118px;line-height:1;margin-top:14px}.n i{color:#D9B77A;padding:0 6px}
.s{font-family:TD;font-size:40px;margin-top:6px;color:#F7EFE3}
.r{width:64px;height:2px;background:#D9B77A;margin:26px 0 20px}
.d{font-family:'Hanken Grotesk',sans-serif;font-size:21px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.88)}
@font-face{font-family:'Hanken Grotesk';font-weight:600;src:url(${f('hanken-grotesk', 'hanken-grotesk-latin-600-normal.woff2')})}
.d{font-weight:600;line-height:1.6}</style>
<div class="bg"></div><div class="sc"></div>
<div class="t"><div class="h">॥ जय श्री कृष्ण ॥</div><div class="n">Rajat <i>&amp;</i><br>Paridhi</div><div class="s">परिणय समारोह</div><div class="r"></div><div class="d">29 Nov – 2 Dec 2026<br>Water Lily Hotel, Indore</div></div>`, path.join(tmp, 'og.png'), 1200, 630);
await sharp(path.join(tmp, 'og.png')).jpeg({ quality: 82, mozjpeg: true }).toFile(pub('og.jpg'));

const icon = (pad) => `<style>${fonts}body{margin:0;width:512px;height:512px;background:#5E1426;display:flex;align-items:center;justify-content:center}
.r{font:${Math.round((512 - pad * 2) * 0.5)}px CG,serif;color:#FBF7F1;letter-spacing:-.02em}.r i{color:#B8955A;margin:0 .04em}</style><div class="r">R<i>&amp;</i>P</div>`;
shot(icon(28), path.join(tmp, 'i512.png'), 512, 512);
shot(icon(100), pub('icon-maskable-512.png'), 512, 512);
fs.copyFileSync(path.join(tmp, 'i512.png'), pub('icon-512.png'));
await sharp(pub('icon-512.png')).resize(192, 192).toFile(pub('icon-192.png'));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('assets generated');
