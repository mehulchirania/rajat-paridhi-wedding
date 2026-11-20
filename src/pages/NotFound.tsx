import { Link } from 'react-router-dom';
import { useApp } from '../lib/app';
import { keep } from '../lib/nav';

export function NotFound() {
  const { t } = useApp();
  return (
    <div className="rounded-2xl border-2 border-dashed border-gold bg-paper p-6 text-center">
      <h2 className="font-display text-[1.7rem] font-bold text-maroon">{t('notfound.title')}</h2>
      <p className="mt-1 text-muted">{t('notfound.body')}</p>
      <Link to={`/${keep()}`} className="tap mt-4 inline-flex items-center rounded-xl bg-maroon px-5 font-bold text-cream">{t('notfound.home')}</Link>
    </div>
  );
}
