// Build-time validation. Fails (exit 1) on malformed data; warns on missing Hindi / placeholders.
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const errors = [];
const warns = [];
const read = (rel) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
  catch (e) { errors.push(`${rel}: invalid JSON — ${e.message}`); return null; }
};

const events = read('src/data/events.json');
const contacts = read('src/data/contacts.json');
const meta = read('src/data/meta.json');
const en = read('src/i18n/en.json');
const hi = read('src/i18n/hi.json');
const schema = read('src/data/events.schema.json');

const E164 = /^[1-9]\d{7,14}$/;

if (events && schema) {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(events)) for (const e of validate.errors) errors.push(`events.json ${e.instancePath} ${e.message}`);
  const seen = new Set();
  for (const ev of events) {
    if (seen.has(ev.id)) errors.push(`events.json: duplicate id "${ev.id}"`);
    seen.add(ev.id);
    if (!ev.time && ev.status !== 'tbd') errors.push(`events.json ${ev.id}: time missing but status is not "tbd"`);
    if (ev.date < '2026-11-29' || ev.date > '2026-12-02') warns.push(`events.json ${ev.id}: date ${ev.date} outside 29 Nov–2 Dec`);
    for (const f of ['title', 'area', 'room', 'notes', 'transport']) {
      if (ev[f] && !ev[f].hi) warns.push(`events.json ${ev.id}.${f}: Hindi missing (falls back to English)`);
    }
    if (ev.dressCode && !ev.dressCode.hi) warns.push(`events.json ${ev.id}.dressCode: Hindi missing`);
  }
  const drafts = events.filter((e) => e.hiDraft).length;
  if (drafts) warns.push(`${drafts} event(s) have DRAFT Hindi (hiDraft:true) — family proofreading needed`);
}

if (contacts) {
  if (!Array.isArray(contacts)) errors.push('contacts.json must be an array');
  else {
    const ids = new Set();
    for (const c of contacts) {
      if (ids.has(c.id)) errors.push(`contacts.json: duplicate id "${c.id}"`);
      ids.add(c.id);
      if (c.kind === 'family') {
        for (const f of ['id', 'side', 'name', 'role', 'phone', 'active']) if (c[f] === undefined) errors.push(`contacts.json ${c.id}: missing "${f}"`);
        if (!['groom', 'bride'].includes(c.side)) errors.push(`contacts.json ${c.id}: side must be groom|bride`);
        if (!['stay-transport', 'timings'].includes(c.role)) errors.push(`contacts.json ${c.id}: role must be stay-transport|timings`);
        if (!E164.test(String(c.phone))) errors.push(`contacts.json ${c.id}: malformed phone "${c.phone}" (digits only, country code first, no +)`);
        if (c.placeholder) warns.push(`contacts.json ${c.id}: PLACEHOLDER number — replace before launch`);
      } else if (c.kind === 'venue') {
        if (!Array.isArray(c.phones) || !c.phones.length) errors.push(`contacts.json ${c.id}: phones[] required`);
        for (const p of c.phones || []) if (!E164.test(String(p))) errors.push(`contacts.json ${c.id}: malformed phone "${p}"`);
      } else errors.push(`contacts.json ${c.id}: kind must be family|venue`);
    }
    for (const side of ['groom', 'bride']) {
      const act = contacts.filter((c) => c.kind === 'family' && c.side === side && c.active);
      if (!act.length) warns.push(`contacts.json: no active ${side}-side contact — WhatsApp buttons will be hidden for that side`);
    }
  }
}

if (meta) {
  if (Number.isNaN(Date.parse(meta.lastUpdated))) errors.push('meta.json: lastUpdated is not a valid ISO date');
  if (!meta.hotel?.mapLink?.startsWith('https://')) errors.push('meta.json: hotel.mapLink must be https://');
}

if (en && hi) {
  const missing = Object.keys(en).filter((k) => !hi[k]);
  if (missing.length) warns.push(`i18n/hi.json: ${missing.length} key(s) missing Hindi → English fallback: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
  const extra = Object.keys(hi).filter((k) => !(k in en));
  if (extra.length) warns.push(`i18n/hi.json: keys not in en.json: ${extra.join(', ')}`);
  warns.push(`i18n/hi.json: ${Object.keys(hi).length} UI strings are DRAFT Hindi — proofread`);

  // literal t('key') usages must exist in en.json
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((f) => f.isDirectory() ? walk(path.join(d, f.name)) : [path.join(d, f.name)]);
  for (const f of walk(path.join(root, 'src')).filter((p) => /\.tsx?$/.test(p))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.-]+)'/g)) {
      if (!(m[1] in en)) errors.push(`${path.relative(root, f)}: t('${m[1]}') missing in i18n/en.json`);
    }
  }
}

for (const w of warns) console.warn('\x1b[33mWARN\x1b[0m ', w);
if (errors.length) {
  for (const e of errors) console.error('\x1b[31mERROR\x1b[0m', e);
  console.error(`\nData validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}).`);
  process.exit(1);
}
console.log('\x1b[32mData validation passed.\x1b[0m');
