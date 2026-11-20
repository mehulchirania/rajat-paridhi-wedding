// Generates icons, OG image, favicon, paisley patterns and gallery placeholders.
// Dev-only helper (needs Google Chrome for OG/icon rendering). Outputs are committed in /public.
// Re-run:  npm run assets
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pub = (p) => path.join(root, 'public', p);
fs.mkdirSync(pub('images/gallery'), { recursive: true });

const paisley = (stroke, op) => `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="1.5">
<g id="p"><path d="M55 20c18 8 24 30 8 46-10 10-26 8-28-4-1-10 8-16 16-16-6-10-4-20 4-26z"/><circle cx="52" cy="52" r="3"/><path d="M45 30c6 4 9 12 5 19"/></g>
<use href="#p" transform="translate(110 110) rotate(180 55 55)"/>
<circle cx="165" cy="45" r="2.500"/><circle cx="45" cy="165" r="2.500"/><circle cx="110" cy="110" r="4"/></svg>`;
fs.writeFileSync(pub('images/pattern-paisley.svg'), paisley('#6B1A2F', 0.07));
fs.writeFileSync(pub('images/pattern-paisley-light.svg'), paisley('#C9A24B', 0.22));

const palette = ['#E9D5C0', '#F2C9D4', '#CFE0F5', '#DCE8D0', '#E6D6F0', '#F6E3B4'];
for (let i = 1; i <= 6; i++) {
  fs.writeFileSync(pub(`images/gallery/gallery-0${i}-REPLACE.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="${palette[i - 1]}"/><circle cx="200" cy="210" r="60" fill="none" stroke="#6B1A2F" stroke-opacity=".35" stroke-width="3"/><text x="200" y="330" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#6B1A2F">Photo ${i} — replace</text></svg>`);
}
fs.writeFileSync(pub('images/monogram-pr-REPLACE.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="#6B1A2F" stroke="#C9A24B" stroke-width="4"/><text x="100" y="122" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="78" fill="#C9A24B">pr</text></svg>`);
fs.writeFileSync(pub('favicon.svg'), fs.readFileSync(pub('images/monogram-pr-REPLACE.svg')));

// Chrome render (fonts from node_modules so Devanagari + serif display are correct)
const f = (pkg, file) => `file://${root}/node_modules/@fontsource/${pkg}/files/${file}`;
const fonts = `
@font-face{font-family:CG;font-weight:700;src:url(${f('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')})}
@font-face{font-family:CG;font-weight:600;font-style:italic;src:url(${f('cormorant-garamond', 'cormorant-garamond-latin-600-italic.woff2')})}
@font-face{font-family:TD;src:url(${f('tiro-devanagari-hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2')})}`;
const tmp = fs.mkdtempSync('/tmp/wedassets-');
const shot = (html, out, w, h) => {
  const file = path.join(tmp, 'p.html');
  fs.writeFileSync(file, html);
  execFileSync('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--window-size=${w},${h}`, `--screenshot=${out}`, `file://${file}`], { stdio: 'ignore' });
};
shot(`<style>${fonts}body{margin:0;width:1200px;height:630px;background:#6B1A2F;color:#F7EFE3;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:CG,TD,serif;border:14px solid #C9A24B;box-sizing:border-box}
.h{font-family:TD;font-size:46px;color:#C9A24B}.n{font-size:118px;font-weight:700;line-height:1}.s{font-size:44px;font-style:italic;font-weight:600;margin-top:10px}.d{font-family:sans-serif;font-size:30px;margin-top:26px;letter-spacing:1px}
.k{width:230px;height:140px;margin-bottom:6px}</style>
<svg class="k" viewBox="0 0 200 120" fill="none" stroke-linecap="round"><path d="M12 100C55 100 80 22 122 40C152 53 140 92 104 80" stroke="#6FA0E8" stroke-width="6"/><path d="M188 100C145 100 120 22 78 40C48 53 60 92 96 80" stroke="#F08FB4" stroke-width="6"/><circle cx="100" cy="62" r="9" fill="#C9A24B"/></svg>
<div class="h">॥ जय श्री कृष्ण ॥</div><div class="n">Rajat &amp; Paridhi</div><div class="s">परिणय समारोह</div><div class="d">29 NOV – 2 DEC 2026 · WATER LILY HOTEL, INDORE</div>`, pub('og.png'), 1200, 630);

const icon = (pad) => `<style>${fonts}body{margin:0;width:512px;height:512px;background:#6B1A2F;display:flex;align-items:center;justify-content:center}
.r{width:${512 - pad * 2}px;height:${512 - pad * 2}px;border-radius:50%;border:8px solid #C9A24B;display:flex;align-items:center;justify-content:center;box-sizing:border-box;font:italic 600 ${Math.round((512 - pad * 2) * 0.55)}px CG,serif;color:#C9A24B;padding-bottom:${Math.round((512 - pad * 2) * 0.06)}px}</style><div class="r">pr</div>`;
shot(icon(28), path.join(tmp, 'i512.png'), 512, 512);
shot(icon(100), pub('icon-maskable-512.png'), 512, 512);
fs.copyFileSync(path.join(tmp, 'i512.png'), pub('icon-512.png'));
await sharp(pub('icon-512.png')).resize(192, 192).toFile(pub('icon-192.png'));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('assets generated');
