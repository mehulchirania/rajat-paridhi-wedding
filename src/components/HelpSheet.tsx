import { useApp } from '../lib/app';
import { contactsForView, openWa } from '../lib/contacts';
import { Sheet } from './Sheet';
import { Icon } from './Icons';
import { useWa } from './useWa';

export function HelpSheet({ open, onClose, page }: { open: boolean; onClose: () => void; page: string }) {
  const { t, l, side } = useApp();
  const wa = useWa();
  const list = contactsForView(side);
  return (
    <Sheet open={open} onClose={onClose} title={t('fab.choose')} titleId="help-title">
      {list.length === 0 ? <p className="text-ink-2">{t('fab.none')}</p> : (
        <ul className="-mt-1">
          {list.map((c) => (
            <li key={c.id} className="border-t border-line first:border-t-0">
              <button type="button" onClick={() => openWa(c.phone, wa.pageMsg(page))}
                className="tap flex w-full items-center gap-3 py-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wa text-white"><Icon name="whatsapp" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.35rem] leading-tight text-ink">{t(`role.${c.role}`)}</span>
                  <span className="block truncate text-[0.92rem] text-ink-2">{c.name}{c.relation ? ` · ${l(c.relation)}` : ''}</span>
                </span>
                {side === 'both' && (
                  <span className={`flex shrink-0 items-center gap-1.5 text-[0.82rem] font-semibold ${c.side === 'groom' ? 'text-groom-ink' : 'text-bride-ink'}`}>
                    <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${c.side === 'groom' ? 'bg-groom' : 'bg-bride'}`} />{t(`side.${c.side}.short`)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
