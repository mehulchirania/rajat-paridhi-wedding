import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../lib/app';
import { events, meta } from '../lib/data';
import { contactsForView, openWa, prettyPhone, telHref, venueContacts } from '../lib/contacts';
import { Icon } from '../components/Icons';
import { CityBadge, SideBadge } from '../components/Badges';
import { useWa } from '../components/useWa';
import { pageLabel } from '../components/HelpFab';

const Card = ({ title, icon, children }: { title: string; icon: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-gold/50 bg-paper p-4">
    <h3 className="mb-2 flex items-center gap-2 font-display text-[1.4rem] font-bold text-maroon"><Icon name={icon} size={22} className="text-gold-dark" />{title}</h3>
    {children}
  </section>
);
const linkBtn = 'tap inline-flex items-center gap-2 rounded-xl border-2 border-maroon px-4 font-bold text-maroon';

export function InfoPage() {
  const { t, l, side, dateLabel } = useApp();
  const wa = useWa();
  const loc = useLocation();
  const fam = contactsForView(side);
  const offsite = new Map<string, (typeof events)[number]>();
  for (const e of events) {
    if (e.venueName && e.venueName !== meta.hotel.name && e.audience === 'all' && (e.mapLink || e.transport) && !offsite.has(e.venueName)) offsite.set(e.venueName, e);
  }
  const order: ('groom' | 'bride')[] = side === 'bride' ? ['bride', 'groom'] : ['groom', 'bride'];
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[1.7rem] font-bold text-maroon">{t('info.title')}</h2>

      <Card title={t('info.hotel')} icon="pin">
        <p className="font-semibold">{meta.hotel.name}</p>
        <p>{l(meta.hotel.address)}</p>
        <a href={meta.hotel.mapLink} target="_blank" rel="noopener noreferrer" className={`${linkBtn} mt-3`}><Icon name="pin" size={18} />{t('sheet.maps')}</a>
        <p className="mt-3"><span className="font-semibold">{t('info.parking')}: </span>{l(meta.hotel.parking)}</p>
        <p className="mt-2"><span className="font-semibold">{t('info.inRoom')}: </span>{l(meta.hotel.inRoom)}</p>
        <p className="mt-2"><span className="font-semibold">{t('info.teaCoffee')}: </span>{l(meta.teaCoffee)}</p>
      </Card>

      <Card title={t('info.contacts')} icon="chat">
        <p className="mb-2 text-[0.92rem] text-muted">{t('info.contactsHint')}</p>
        {fam.length === 0 ? <p>{t('fab.none')}</p> : (
          <ul className="space-y-2">
            {fam.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => openWa(c.phone, wa.pageMsg(pageLabel(loc.pathname, t, dateLabel)))} className="tap flex w-full items-center gap-3 rounded-xl border border-[#1F7A4D]/50 bg-cream p-3 text-left">
                  <Icon name="chat" className="shrink-0 text-[#1F7A4D]" />
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{t(`role.${c.role}`)}</span><span className="block truncate text-[0.9rem] text-muted">{c.name}</span></span>
                  {side === 'both' && <SideBadge side={c.side} />}
                </button>
              </li>
            ))}
          </ul>
        )}
        {venueContacts.map((v) => (
          <div key={v.id} className="mt-4 border-t border-gold/40 pt-3">
            <p className="font-semibold">{l(v.name)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {v.phones.map((p) => <a key={p} href={telHref(p)} className={linkBtn}><Icon name="phone" size={18} />{t('info.call', { n: prettyPhone(p) })}</a>)}
            </div>
          </div>
        ))}
      </Card>

      <Card title={t('info.venues')} icon="pin">
        <ul className="space-y-4">
          {[...offsite.values()].map((e) => (
            <li key={e.venueName}>
              <p className="flex flex-wrap items-center gap-2 font-semibold">{e.venueName}<CityBadge city={e.city} /></p>
              {e.transport && <p className="text-[0.95rem]">{l(e.transport)}</p>}
              {e.mapLink && <a href={e.mapLink} target="_blank" rel="noopener noreferrer" className={`${linkBtn} mt-2`}><Icon name="pin" size={18} />{t('sheet.maps')}</a>}
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t('info.families')} icon="home">
        <ul className="space-y-3">
          {order.map((s) => (
            <li key={s} className="flex items-start gap-2"><SideBadge side={s} /><span><span className="block font-semibold">{l(meta.couple[s].name)}</span><span className="text-[0.92rem] text-muted">{l(meta.couple[s].parents)}</span></span></li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
