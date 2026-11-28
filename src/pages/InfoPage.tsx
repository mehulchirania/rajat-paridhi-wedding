import { keep } from '../lib/nav';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../lib/app';
import { events, meta } from '../lib/data';
import { contactsForView, openWa, prettyPhone, telHref, venueContacts } from '../lib/contacts';
import { infoPhoto } from '../lib/photos';
import { Icon } from '../components/Icons';
import { Photo } from '../components/Photo';
import { ThemePicker } from '../components/Toggles';
import { useWa } from '../components/useWa';
import { pageLabel } from '../components/HelpFab';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-line py-7 first:border-t-0">
    <h3 className="mb-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-champagne-ink">{title}</h3>
    {children}
  </section>
);
const outline = 'tap inline-flex items-center gap-2 rounded-xl border border-oxblood px-4 text-[1rem] font-semibold text-oxblood hover:bg-sand';
const sideDot = (s: 'groom' | 'bride') => (s === 'groom' ? 'bg-groom' : 'bg-bride');
const sideInk = (s: 'groom' | 'bride') => (s === 'groom' ? 'text-groom-ink' : 'text-bride-ink');

export function InfoPage() {
  const { t, l, lang, side, dateLabel, bigText, setBigText } = useApp();
  const goWelcome = useNavigate();
  const wa = useWa();
  const loc = useLocation();
  const fam = contactsForView(side);
  const photo = infoPhoto();
  const offsite = new Map<string, (typeof events)[number]>();
  for (const e of events) {
    if (e.venueName && e.venueName !== meta.hotel.name && e.audience === 'all' && (e.mapLink || e.transport) && !offsite.has(e.venueName)) offsite.set(e.venueName, e);
  }
  const order: ('groom' | 'bride')[] = side === 'bride' ? ['bride', 'groom'] : ['groom', 'bride'];
  const updated = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(meta.lastUpdated));

  return (
    <div>
      <h2 className="sr-only">{t('info.title')}</h2>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
        <Photo p={photo} priority className="h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white/85">{t('info.hotel')}</p>
          <p className="font-display text-[2.6rem] leading-none">{meta.hotel.name}</p>
        </div>
      </div>

      <div className="mt-3">
        <Section title={t('info.address')}>
          <p className="text-ink">{l(meta.hotel.address)}</p>
          <a href={meta.hotel.mapLink} target="_blank" rel="noopener noreferrer" className={`${outline} mt-4`}><Icon name="pin" size={18} />{t('sheet.maps')}</a>
        </Section>

        <Section title={t('info.inRoom')}><p className="text-ink-2">{l(meta.hotel.inRoom)}</p></Section>
        <Section title={t('info.parking')}><p className="text-ink-2">{l(meta.hotel.parking)}</p></Section>
        <Section title={t('info.teaCoffee')}><p className="text-ink-2">{l(meta.teaCoffee)}</p></Section>

        <Section title={t('info.familyContacts')}>
          <p className="mb-1 text-[0.92rem] text-ink-2">{t('info.contactsHint')}</p>
          {fam.length === 0 ? <p className="text-ink-2">{t('fab.none')}</p> : (
            <ul>
              {fam.map((c) => (
                <li key={c.id} className="border-t border-line first:border-t-0">
                  <button type="button" onClick={() => openWa(c.phone, wa.pageMsg(pageLabel(loc.pathname, t, dateLabel)))} className="tap flex w-full items-center gap-3 py-3 text-left">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wa text-white"><Icon name="whatsapp" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.35rem] leading-tight text-ink">{t(`role.${c.role}`)}</span>
                      <span className="block truncate text-[0.92rem] text-ink-2">{c.name}</span>
                    </span>
                    {side === 'both' && (
                      <span className={`flex shrink-0 items-center gap-1.5 text-[0.82rem] font-semibold ${sideInk(c.side)}`}>
                        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${sideDot(c.side)}`} />{t(`side.${c.side}.short`)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {venueContacts().length > 0 && (
          <Section title={t('info.helpdeskShort')}>
            {venueContacts().map((v) => (
              <div key={v.id}>
                <p className="text-ink-2">{l(v.name)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {v.phones.map((p) => <a key={p} href={telHref(p)} className={outline}><Icon name="phone" size={18} /><span style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>{t('info.call', { n: prettyPhone(p) })}</span></a>)}
                </div>
              </div>
            ))}
          </Section>
        )}

        {offsite.size > 0 && (
          <Section title={t('info.venues')}>
            <ul className="space-y-5">
              {[...offsite.values()].map((e) => (
                <li key={e.venueName}>
                  <p className="font-display text-[1.35rem] leading-tight text-ink">{e.venueName}<span className="font-sans text-[0.9rem] text-ink-2"> · {t(`city.${e.city}`)}</span></p>
                  {e.transport && <p className="mt-1 text-[0.95rem] text-ink-2">{l(e.transport)}</p>}
                  {e.mapLink && <a href={e.mapLink} target="_blank" rel="noopener noreferrer" className={`${outline} mt-3`}><Icon name="pin" size={18} />{t('sheet.maps')}</a>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title={t('info.families')}>
          <ul className="space-y-4">
            {order.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span aria-hidden="true" className={`mt-3 h-2.5 w-2.5 shrink-0 rounded-full ${sideDot(s)}`} />
                <span><span className="block font-display text-[1.6rem] leading-tight text-ink">{l(meta.couple[s].name)}</span><span className="text-[0.92rem] text-ink-2">{l(meta.couple[s].parents)}</span></span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('info.display')}>
          <div className="flex min-h-[44px] items-center justify-between gap-4">
            <span id="bigtext-label" className="text-ink">{t('size.toggle')}</span>
            <button type="button" role="switch" aria-checked={bigText} aria-labelledby="bigtext-label" onClick={() => setBigText(!bigText)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ease-(--ease-out) ${bigText ? 'bg-oxblood' : 'bg-line'}`}>
              <span aria-hidden="true" className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-(--ease-out) ${bigText ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <ThemePicker />
          <button type="button" onClick={() => goWelcome(`/welcome${keep()}`, { state: { from: loc.pathname + loc.search } })} className="tap mt-2 inline-flex items-center font-semibold text-oxblood underline underline-offset-4">{t('footer.replay')}</button>
        </Section>

        <p className="border-t border-line pt-5 text-center text-[0.85rem] text-ink-2">{t('footer.updated', { date: updated })}</p>
      </div>
    </div>
  );
}
