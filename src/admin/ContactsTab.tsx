import type { Issue } from '../../shared/validate';
import type { Content } from '../lib/data';
import type { FamilyContact, VenueContact } from '../types';
import { Btn, Card, Check, Field, L10nInput, Select, Text, clean, uid } from './ui';

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }
const digits = (v: string) => v.replace(/\D/g, '');
const fixIn = (v: string) => (digits(v).length === 10 ? `91${digits(v)}` : digits(v));
export const isPlaceholderPhone = (p: string) => /^910{7,}/.test(p);

export function ContactsTab({ draft, setDraft, issues }: P) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (id: string, f: (c: any) => object) => setDraft((d) => ({ ...d, contacts: d.contacts.map((c) => (c.id === id ? (clean(f(c)) as typeof c) : c)) }));
  const del = (id: string) => setDraft((d) => ({ ...d, contacts: d.contacts.filter((c) => c.id !== id) }));
  const add = (c: FamilyContact | VenueContact) => setDraft((d) => ({ ...d, contacts: [...d.contacts, c] }));
  const family = draft.contacts.filter((c): c is FamilyContact => c.kind === 'family');
  const venues = draft.contacts.filter((c): c is VenueContact => c.kind === 'venue');
  const fake = family.filter((c) => c.active && (c.placeholder || isPlaceholderPhone(c.phone)));
  const err = (id: string, f?: string) => issues.find((i) => i.path === `contacts.${id}.${f ?? ''}` || (!f && i.path.startsWith(`contacts.${id}.`)))?.msg;

  return (
    <div className="space-y-5">
      {fake.length > 0 && <p role="alert" className="rounded-xl bg-amber-soft p-3 text-[0.92rem] font-medium text-amber-ink">⚠ {fake.length} active contact{fake.length > 1 ? 's still have' : ' still has'} a PLACEHOLDER number ({fake.map((c) => c.name).join(', ')}). Guests tapping WhatsApp would message a dead number.</p>}

      <h2 className="font-display text-[1.5rem]">Family WhatsApp contacts</h2>
      {family.map((c) => (
        <Card key={c.id}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" error={err(c.id, 'name')}><Text value={c.name} onChange={(v) => set(c.id, (x) => ({ ...x, name: v }))} /></Field>
            <Field label="WhatsApp number" error={err(c.id, 'phone')} hint="With country code, e.g. 91 98765 43210. Guests never see this number, only the WhatsApp button.">
              <Text inputMode="tel" value={c.phone} onChange={(v) => set(c.id, (x) => ({ ...x, phone: digits(v), placeholder: undefined }))} onBlur={() => set(c.id, (x) => ({ ...x, phone: fixIn((x as FamilyContact).phone) }))} />
            </Field>
            <Field label="Side"><Select value={c.side} options={['groom', 'bride']} onChange={(v) => set(c.id, (x) => ({ ...x, side: v }))} /></Field>
            <Field label="Used for" hint="“timings” shows on event sheets."><Select value={c.role} options={[{ v: 'stay-transport', label: 'stay / transport' }, { v: 'timings', label: 'timings' }]} onChange={(v) => set(c.id, (x) => ({ ...x, role: v }))} /></Field>
            <Field label="Only for city (optional)"><Select value={c.city ?? ''} options={['', 'Pune', 'Indore']} onChange={(v) => set(c.id, (x) => ({ ...x, city: v || undefined }))} /></Field>
          </div>
          <div className="mt-3"><L10nInput label="Relation (e.g. Brother)" value={c.relation} onChange={(v) => set(c.id, (x) => ({ ...x, relation: v }))} error={err(c.id, 'relation')} /></div>
          <Check label="Active (shown to guests)" checked={c.active} onChange={(v) => set(c.id, (x) => ({ ...x, active: v }))} />
          <Check label="Main contact for this side" checked={!!c.primary} onChange={(v) => set(c.id, (x) => ({ ...x, primary: v || undefined }))} />
          <Check label="This is still a placeholder number" checked={!!c.placeholder} onChange={(v) => set(c.id, (x) => ({ ...x, placeholder: v || undefined }))} />
          <Btn small kind="danger" className="mt-2" onClick={() => del(c.id)}>Delete contact</Btn>
        </Card>
      ))}
      <Btn small onClick={() => add({ id: uid('contact'), kind: 'family', side: 'groom', name: 'New contact', role: 'timings', phone: '', active: false })}>+ Add family contact</Btn>

      <h2 className="pt-4 font-display text-[1.5rem]">On-site help desk</h2>
      <p className="-mt-3 text-[0.9rem] text-ink-2">These numbers are shown on the Info page as tap-to-call buttons.</p>
      {venues.map((v) => (
        <Card key={v.id}>
          <L10nInput label="Name" required value={v.name} onChange={(n) => set(v.id, (x) => ({ ...x, name: n ?? { en: '' } }))} error={err(v.id, 'name')} />
          <div className="mt-3 space-y-2">
            {v.phones.map((p, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1"><Field label={`Phone ${i + 1}`} error={i === 0 ? err(v.id, 'phones') : undefined}><Text inputMode="tel" value={p} onChange={(val) => set(v.id, (x) => ({ ...x, phones: (x as VenueContact).phones.map((q, j) => (j === i ? digits(val) : q)) }))} onBlur={() => set(v.id, (x) => ({ ...x, phones: (x as VenueContact).phones.map((q, j) => (j === i ? fixIn(q) : q)) }))} /></Field></div>
                <Btn small kind="danger" aria-label={`Remove phone ${i + 1}`} onClick={() => set(v.id, (x) => ({ ...x, phones: (x as VenueContact).phones.filter((_, j) => j !== i) }))}>✕</Btn>
              </div>
            ))}
            <Btn small onClick={() => set(v.id, (x) => ({ ...x, phones: [...(x as VenueContact).phones, ''] }))}>+ Add number</Btn>
          </div>
          <Check label="Active (shown to guests)" checked={v.active} onChange={(a) => set(v.id, (x) => ({ ...x, active: a }))} />
          <Btn small kind="danger" onClick={() => del(v.id)}>Delete</Btn>
        </Card>
      ))}
      <Btn small onClick={() => add({ id: uid('desk'), kind: 'venue', name: { en: 'Help desk' }, phones: [''], active: false })}>+ Add help desk</Btn>
    </div>
  );
}
