import { useApp } from '../lib/app';
import type { EventItem, GuestSide } from '../types';
import { contactsForEvent, openWa } from '../lib/contacts';
import { buildIcs, downloadIcs } from '../lib/ics';
import { dateToSlug } from '../lib/time';
import { Sheet } from './Sheet';
import { Icon } from './Icons';
import { CityBadge, ConfirmBadge, DiffersBadge, SideBadge } from './Badges';
import { Swatch } from './Swatch';
import { TimeText, whereText } from './EventCard';
import { useWa } from './useWa';

const btn = 'tap flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[1rem] font-bold';

export function EventSheet({ ev, view, onClose }: { ev: EventItem | undefined; view: GuestSide; onClose: () => void }) {
  const { t, l, dateLabel } = useApp();
  const wa = useWa();
  if (!ev) return null;
  const where = whereText(ev, l, t('event.venueTbd'));
  const url = `${window.location.origin}/day/${dateToSlug(ev.date)}?e=${ev.id}`;
  const ics = buildIcs(ev, view, { title: l(ev.title), where: ev.venueName ? where : '', notes: l(ev.notes), confirming: t('ics.confirming') }, url);
  const contacts = contactsForEvent(view, ev);
  const shareText = t('wa.share', { title: l(ev.title), date: dateLabel(ev.date), time: ev.time ? '' : t('event.timeTbd'), where, url }).replace(/\n{2,}/g, '\n');

  return (
    <Sheet open onClose={onClose} title={l(ev.title)} titleId="event-title">
      <div className="mb-3 flex flex-wrap gap-1.5"><SideBadge side={ev.side} /><CityBadge city={ev.city} />{(ev.needsConfirmation || ev.status === 'tbd') && <ConfirmBadge />}</div>
      <dl className="space-y-3 text-[1rem]">
        <div><dt className="text-[0.82rem] font-semibold uppercase tracking-wide text-muted">{t('sheet.when')}</dt>
          <dd className="font-semibold">{dateLabel(ev.date)} · <TimeText ev={ev} view={view} /></dd>
          {view === 'both' && <dd className="mt-1"><DiffersBadge ev={ev} /></dd>}</div>
        <div><dt className="text-[0.82rem] font-semibold uppercase tracking-wide text-muted">{t('sheet.where')}</dt><dd>{where}</dd></div>
        {ev.dressCode && <div><dt className="text-[0.82rem] font-semibold uppercase tracking-wide text-muted">{t('event.dress')}</dt>
          <dd className="flex items-center gap-2"><Swatch kind={ev.dressCode.swatch} size={32} /><span className="font-semibold">{l(ev.dressCode)}</span></dd></div>}
        {ev.notes && <div><dt className="text-[0.82rem] font-semibold uppercase tracking-wide text-muted">{t('sheet.notes')}</dt><dd>{l(ev.notes)}</dd></div>}
        {ev.transport && <div><dt className="text-[0.82rem] font-semibold uppercase tracking-wide text-muted">{t('sheet.transport')}</dt><dd>{l(ev.transport)}</dd></div>}
      </dl>
      <div className="mt-5 space-y-2.5">
        {ics
          ? <button type="button" onClick={() => downloadIcs(`${ev.id}.ics`, ics)} className={`${btn} border-maroon bg-maroon text-cream`}><Icon name="cal" />{t('sheet.calendar')}</button>
          : <p className="rounded-xl bg-cream p-3 text-[0.92rem] text-muted">{t('sheet.calendarTbd')}</p>}
        {ev.mapLink && <a href={ev.mapLink} target="_blank" rel="noopener noreferrer" className={`${btn} border-maroon bg-paper text-maroon`}><Icon name="pin" />{t('sheet.maps')}</a>}
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className={`${btn} border-maroon bg-paper text-maroon`}><Icon name="share" />{t('sheet.share')}</a>
        {contacts.map((c) => (
          <button key={c.id} type="button" onClick={() => openWa(c.phone, wa.eventMsg(ev))} className={`${btn} border-[#1F7A4D] bg-[#1F7A4D] text-white`}>
            <Icon name="chat" />
            {contacts.length > 1 ? `${t('sheet.whatsapp', { name: t(`side.${c.side}.short`) })}` : t('sheet.whatsapp', { name: c.name })}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
