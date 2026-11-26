import { Link } from 'react-router-dom';
import { useApp } from '../lib/app';
import { keep } from '../lib/nav';

export function NotFound() {
  const { t } = useApp();
  return (
    <div className="px-2 py-20 text-center">
      <h2 className="font-display text-[2.2rem] font-normal leading-tight text-ink">{t('notfound.title')}</h2>
      <p className="mx-auto mt-3 max-w-xs text-ink-2">{t('notfound.body')}</p>
      <Link to={`/${keep()}`} className="tap mt-7 inline-flex items-center rounded-xl bg-oxblood px-6 font-semibold text-on-wine hover:bg-oxblood-2">{t('notfound.home')}</Link>
    </div>
  );
}
