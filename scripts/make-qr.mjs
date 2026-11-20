// Usage: npm run qr -- https://final-url.example
import QRCode from 'qrcode';
import path from 'node:path';
const url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) { console.error('Usage: npm run qr -- https://your-final-url'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#6B1A2F', light: '#F7EFE3' } };
await QRCode.toFile(path.join(root, 'public/qr.png'), url, { ...opts, width: 1024 });
await QRCode.toFile(path.join(root, 'public/qr.svg'), url, { ...opts, type: 'svg' });
console.log('QR written to public/qr.png and public/qr.svg for', url);
