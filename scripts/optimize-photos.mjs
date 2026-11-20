// Reads images/photos.config.json, writes optimized WebP (640/1280w) to public/images/photos/
// and src/data/photos.generated.json (paths, focal, alt, tiny blur placeholder). Strips EXIF/GPS.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'images/photos.config.json'), 'utf8'));
const outDir = path.join(root, 'public/images/photos');
fs.mkdirSync(outDir, { recursive: true });
const out = { photos: {}, days: cfg.days, splash: cfg.splash, info: cfg.info };
for (const p of cfg.photos) {
  const src = path.join(root, 'images', p.source);
  if (!fs.existsSync(src)) { console.error(`Missing source for ${p.slug}: ${p.source}`); process.exit(1); }
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  for (const w of [640, 1280]) {
    await sharp(src).rotate().resize({ width: Math.min(w, meta.width) }).webp({ quality: w === 640 ? 72 : 70 }).toFile(path.join(outDir, `${p.slug}-${w}.webp`));
  }
  const blur = await sharp(src).rotate().resize(16).webp({ quality: 40 }).toBuffer();
  const ratio = (meta.orientation >= 5 ? meta.width / meta.height : meta.height / meta.width);
  out.photos[p.slug] = {
    src640: `/images/photos/${p.slug}-640.webp`, src1280: `/images/photos/${p.slug}-1280.webp`,
    focal: p.focal || '50% 50%', alt: p.alt, aspect: Number((1 / ratio).toFixed(3)),
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
  };
}
for (const [k, v] of Object.entries(cfg.days)) if (!out.photos[v]) { console.error(`days.${k} -> unknown slug ${v}`); process.exit(1); }
fs.writeFileSync(path.join(root, 'src/data/photos.generated.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Optimized ${cfg.photos.length} photos -> public/images/photos/`);
