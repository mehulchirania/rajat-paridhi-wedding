import type { Issue } from '../../shared/validate';
import type { Content } from '../lib/data';
import type { L10n, Meta } from '../types';
import { Card, Field, L10nInput, Text } from './ui';

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }

export function InfoTab({ draft, setDraft, issues }: P) {
  const m = draft.meta;
  const patch = (f: (m: Meta) => Meta) => setDraft((d) => ({ ...d, meta: f(d.meta) }));
  const e = (path: string) => issues.find((i) => i.path === `meta.${path}`)?.msg;
  const hotel = <K extends keyof Meta['hotel']>(k: K, v: Meta['hotel'][K]) => patch((x) => ({ ...x, hotel: { ...x.hotel, [k]: v } }));
  const req = (v: L10n | undefined): L10n => v ?? { en: '' };
  return (
    <div className="space-y-5">
      <h2 className="font-display text-[1.5rem]">Hotel & venue info</h2>
      <Card className="space-y-4">
        <Field label="Hotel name" error={e('hotel.name')}><Text value={m.hotel.name} onChange={(v) => hotel('name', v)} /></Field>
        <L10nInput label="Address" required value={m.hotel.address} onChange={(v) => hotel('address', req(v))} error={e('hotel.address')} />
        <Field label="Google Maps link" error={e('hotel.mapLink')}><Text inputMode="url" autoCapitalize="none" value={m.hotel.mapLink} onChange={(v) => hotel('mapLink', v.trim())} /></Field>
        <L10nInput label="Parking" multiline required value={m.hotel.parking} onChange={(v) => hotel('parking', req(v))} error={e('hotel.parking')} />
        <L10nInput label="In-room help" multiline required value={m.hotel.inRoom} onChange={(v) => hotel('inRoom', req(v))} error={e('hotel.inRoom')} />
        <L10nInput label="Tea / coffee line" multiline required value={m.teaCoffee} onChange={(v) => patch((x) => ({ ...x, teaCoffee: req(v) }))} error={e('teaCoffee')} />
      </Card>
      <h2 className="font-display text-[1.5rem]">Couple & families</h2>
      {(['groom', 'bride'] as const).map((s) => (
        <Card key={s} className="space-y-4">
          <p className="eyebrow text-ink-2">{s}</p>
          <L10nInput label="Name" required value={m.couple[s].name} onChange={(v) => patch((x) => ({ ...x, couple: { ...x.couple, [s]: { ...x.couple[s], name: req(v) } } }))} error={e(`couple.${s}.name`)} />
          <L10nInput label="Parents line" required value={m.couple[s].parents} onChange={(v) => patch((x) => ({ ...x, couple: { ...x.couple, [s]: { ...x.couple[s], parents: req(v) } } }))} error={e(`couple.${s}.parents`)} />
        </Card>
      ))}
    </div>
  );
}
