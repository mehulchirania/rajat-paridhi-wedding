import { EventBadge } from './Icons';
import { glossOf } from '../lib/gloss';
import type { ReactNode } from 'react';
import { useApp } from '../lib/app';
import type { EventItem, GuestSide } from '../types';
import { contactsForEvent, openWa } from '../lib/contacts';
import { differsBySide } from '../lib/data';
import { buildIcs, downloadIcs } from '../lib/ics';
import { dateToSlug } from '../lib/time';
import { Sheet } from './Sheet';
import { Icon } from './Icons';
import { Swatch } from './Swatch';
import { TimeText, whereText } from './EventCard';
import { useWa } from './useWa';

const btn = 'tap flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[1rem] font-semibold transition-colors';
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-t border-line py-3.5 first:border-t-0 first:pt-0">
    <dt className="mb-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink-2">{label}</dt>
    <dd className="text-[1rem] text-ink">{children}</dd>
  </div>
);

export function EventSheet({ ev, view, onClose }: { ev: EventItem | undefined; view: GuestSide; onClose: () => void }) {
  const { t, l, lang, time, dateLabel } = useApp();
  const wa = useWa();
  if (!ev) return null;
  const where = whereText(ev, l, t('event.venueTbd'));
  const url = `${window.location.origin}/day/${dateToSlug(ev.date)}?e=${ev.id}`;
  const ics = buildIcs(ev, view, { title: l(ev.title), where: ev.venueName ? where : '', notes: l(ev.notes), confirming: t('ics.confirming') }, url);
  const contacts = contactsForEvent(view, ev);
  const shareText = t('wa.share', { title: l(ev.title), date: dateLabel(ev.date), time: ev.time ? '' : t('event.timeTbd'), where, url }).replace(/\n{2,}/g, '\n');
  const confirming = ev.needsConfirmation || ev.status === 'tbd';
  const sideTone = ev.side === 'groom' ? 'text-groom-ink' : ev.side === 'bride' ? 'text-bride-ink' : 'text-ink';
  const eyebrow = (
    <>
      <span className={sideTone}>{t(`side.${ev.side}.of`)}</span>
      <span className="text-ink-2"> · {t(`city.${ev.city}`)}</span>
    </>
  );
  const showSides = view === 'both' && differsBySide(ev) && !!ev.time;
  const gTime = ev.timeBySide?.groom ?? ev.time;
  const bTime = ev.timeBySide?.bride ?? ev.time;

  return (
    <Sheet open onClose={onClose} title={<span className="flex items-start gap-3"><EventBadge ev={ev} size={44} /><span className="min-w-0">{l(ev.title)}{glossOf(ev, lang) && <span className="mt-1 block font-body text-[0.95rem] leading-snug text-ink-2">{glossOf(ev, lang)}</span>}</span></span>} titleId="event-title" eyebrow={eyebrow}>
      <dl>
        <Row label={t('sheet.when')}>
          <span className="font-semibold">{dateLabel(ev.date)}</span>
          <span className="text-ink-2"> · </span>
          <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}><TimeText ev={ev} view={view} /></span>
          {showSides && gTime && bTime && (
            <span className="mt-1 flex flex-wrap gap-x-4 text-[0.92rem] font-semibold" style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}>
              <span className="text-groom-ink">{t('differs.groom', { time: time(gTime) })}</span>
              <span className="text-bride-ink">{t('differs.bride', { time: time(bTime) })}</span>
            </span>
          )}
          {confirming && (
            <span className="mt-1.5 flex items-center gap-2 text-[0.92rem] font-semibold text-amber-ink">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-ink" />{t('badge.confirming')}
            </span>
          )}
        </Row>
        <Row label={t('sheet.where')}><span className="flex items-start gap-1.5"><Icon name="pin" size={18} className="mt-[0.2rem] shrink-0" /><span>{where}</span></span></Row>
        {ev.dressCode && (
          <Row label={t('event.dress')}>
            <span className="flex items-center gap-2.5"><Swatch kind={ev.dressCode.swatch} size={20} /><span className="font-semibold">{l(ev.dressCode)}</span></span>
          </Row>
        )}
        {ev.notes && <Row label={t('sheet.notes')}><span className="text-ink-2">{l(ev.notes)}</span></Row>}
        {ev.transport && <Row label={t('sheet.transport')}><span className="text-ink-2">{l(ev.transport)}</span></Row>}
      </dl>

      <div className="mt-5 space-y-2.5">
        {ics
          ? <button type="button" onClick={() => downloadIcs(`${ev.id}.ics`, ics)} className={`${btn} bg-oxblood text-ivory hover:bg-oxblood-2`}><Icon name="cal" />{t('sheet.calendar')}</button>
          : <p className="rounded-xl bg-sand p-3 text-[0.92rem] text-ink-2">{t('sheet.calendarTbd')}</p>}
        <div className="flex gap-2.5">
          {ev.mapLink && <a href={ev.mapLink} target="_blank" rel="noopener noreferrer" className={`${btn} flex-1 border border-oxblood text-oxblood hover:bg-sand`}><Icon name="pin" />{t('sheet.mapsShort')}</a>}
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className={`${btn} flex-1 border border-oxblood text-oxblood hover:bg-sand`}><Icon name="share" />{t('sheet.shareShort')}</a>
        </div>
        {contacts.map((c) => (
          <button key={c.id} type="button" onClick={() => openWa(c.phone, wa.eventMsg(ev))} className={`${btn} bg-wa text-white`}>
            <Icon name="whatsapp" />
            {contacts.length > 1 ? t('sheet.whatsapp', { name: t(`side.${c.side}.short`) }) : t('sheet.whatsapp', { name: c.name })}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
