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

/** Dock action: opens the WhatsApp help sheet. Hidden when the current side has no contacts. */
export function HelpButton({ className = '' }: { className?: string }) {
  const { t, side, dateLabel } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  if (!contactsForView(side).length) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={t('fab.label')} aria-haspopup="dialog" className={className}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white"><Icon name="chat" size={18} /></span>
        <span>{t('dock.help')}</span>
      </button>
      <HelpSheet open={open} onClose={() => setOpen(false)} page={pageLabel(loc.pathname, t, dateLabel)} />
    </>
  );
}
