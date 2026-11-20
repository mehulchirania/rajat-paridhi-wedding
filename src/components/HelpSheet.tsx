import { useApp } from '../lib/app';
import { contactsForView, openWa } from '../lib/contacts';
import { Sheet } from './Sheet';
import { Icon } from './Icons';
import { SideBadge } from './Badges';
import { useWa } from './useWa';

export function HelpSheet({ open, onClose, page }: { open: boolean; onClose: () => void; page: string }) {
  const { t, l, side } = useApp();
  const wa = useWa();
  const list = contactsForView(side);
  return (
    <Sheet open={open} onClose={onClose} title={t('fab.choose')} titleId="help-title">
      {list.length === 0 ? <p>{t('fab.none')}</p> : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => openWa(c.phone, wa.pageMsg(page))}
                className="tap flex w-full items-center gap-3 rounded-2xl border border-gold/60 bg-cream p-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1F7A4D] text-white"><Icon name="chat" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-maroon">{t(`role.${c.role}`)}</span>
                  <span className="block truncate text-[0.92rem] text-muted">{c.name}{c.relation ? ` · ${l(c.relation)}` : ''}</span>
                </span>
                {side === 'both' && <SideBadge side={c.side} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
