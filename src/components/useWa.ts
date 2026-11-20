import { useApp } from '../lib/app';
import type { EventItem } from '../types';
import { resolveTime } from '../lib/data';

export function useWa() {
  const { t, l, time, dateLabel, side } = useApp();
  const guest = t(`guest.${side}`);
  return {
    eventMsg(ev: EventItem) {
      const rt = resolveTime(ev, side);
      const vars = { guest, event: l(ev.title), date: dateLabel(ev.date), time: rt ? time(rt) : '' };
      return rt ? t('wa.msg.event', vars) : t('wa.msg.eventNoTime', vars);
    },
    pageMsg(page: string) { return t('wa.msg.page', { guest, page }); },
  };
}
