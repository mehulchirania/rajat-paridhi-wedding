import { useApp } from '../lib/app';
import { meta } from '../lib/data';

export function GalleryPage() {
  const { t, l } = useApp();
  return (
    <section>
      <h2 className="mb-3 font-display text-[1.7rem] font-bold text-maroon">{t('gallery.title')}</h2>
      {meta.gallery.length === 0 ? <p className="text-muted">{t('gallery.soon')}</p> : (
        <ul className="grid grid-cols-2 gap-3">
          {meta.gallery.map((g, i) => (
            <li key={g.src} className="overflow-hidden rounded-2xl border border-gold/50 bg-paper">
              <img src={g.src} alt={l(g.alt)} width={400} height={500} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" className="aspect-[4/5] h-auto w-full object-cover" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
