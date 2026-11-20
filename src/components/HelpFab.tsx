import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../lib/app';
import { contactsForView } from '../lib/contacts';
import { dayBySlug } from '../lib/data';
import { HelpSheet } from './HelpSheet';
import { Icon } from './Icons';

export function pageLabel(pathname: string, t: (k: string, v?: Record<string, string | number>) => string, dateLabel: (d: string) => string) {
  const m = pathname.match(/^\/day\/([^/]+)/);
  const d = m && dayBySlug(m[1]);
  return d ? t('page.itinerary', { date: dateLabel(d.date) }) : t('page.info');
}

export function HelpFab() {
  const { t, side, dateLabel } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  if (!contactsForView(side).length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('fab.label')}
        className="tap fixed bottom-[76px] right-4 z-30 inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-4 py-3 text-[0.95rem] font-bold text-white shadow-lg">
        <Icon name="chat" /> <span>{t('nownext.help')}</span>
      </button>
      <HelpSheet open={open} onClose={() => setOpen(false)} page={pageLabel(loc.pathname, t, dateLabel)} />
    </>
  );
}
