import type { Issue } from '../../shared/validate';
import type { Content } from '../lib/data';
import type { FamilyContact, VenueContact } from '../types';
import { Btn, Card, Check, Field, L10nInput, PageHead, Select, Text, clean, uid } from './ui';

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }
const digits = (v: string) => v.replace(/\D/g, '');
/** A bare 10-digit number is assumed to be Indian (+91). */
const fixIn = (v: string) => (digits(v).length === 10 ? `91${digits(v)}` : digits(v));
export const isPlaceholderPhone = (p: string) => /^910{7,}/.test(p);

/** "14048201871" → "+1 (404) 820-1871", "919876543210" → "+91 98765 43210". */
export function prettyIntl(p: string): string {
  const d = digits(p);
  if (!d) return '';
  if (/^1\d{10}$/.test(d)) return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (/^91\d{10}$/.test(d)) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

function PhoneField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const fake = isPlaceholderPhone(value);
  return (
    <Field label={label} error={error}>
      <Text inputMode="tel" autoComplete="off" placeholder="e.g. 1 404 820 1871 or 98765 43210" value={value} onChange={(v) => onChange(digits(v))} onBlur={() => onChange(fixIn(value))} />
      {value && !error && (
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
          <span className={fake ? 'font-semibold text-amber-ink' : 'font-semibold text-ink'}>{fake ? '⚠ Placeholder, not a real number' : prettyIntl(value)}</span>
          {!fake && <a href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-oxblood underline underline-offset-2">Test on WhatsApp ↗</a>}
        </span>
      )}
    </Field>
  );
}

export function ContactsTab({ draft, setDraft, issues }: P) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (id: string, f: (c: any) => object) => setDraft((d) => ({ ...d, contacts: d.contacts.map((c) => (c.id === id ? (clean(f(c)) as typeof c) : c)) }));
  const del = (id: string) => setDraft((d) => ({ ...d, contacts: d.contacts.filter((c) => c.id !== id) }));
  const add = (c: FamilyContact | VenueContact) => setDraft((d) => ({ ...d, contacts: [...d.contacts, c] }));
  const family = draft.contacts.filter((c): c is FamilyContact => c.kind === 'family');
  const venues = draft.contacts.filter((c): c is VenueContact => c.kind === 'venue');
  const fake = family.filter((c) => c.active && (c.placeholder || isPlaceholderPhone(c.phone)));
  const err = (id: string, f?: string) => issues.find((i) => i.path === `contacts.${id}.${f ?? ''}` || (!f && i.path.startsWith(`contacts.${id}.`)))?.msg;
  const newContact = (side: 'groom' | 'bride') => add({ id: uid(`${side}-contact`), kind: 'family', side, name: `${side === 'groom' ? 'Groom' : 'Bride'} contact`, role: 'timings', phone: '', active: false });

  return (
    <div className="space-y-6">
      <PageHead title="Phone numbers" sub="Who guests message on WhatsApp when they need help. Guests never see the number itself, only a WhatsApp button." />
      {fake.length > 0 && <p role="alert" className="rounded-xl bg-amber-soft p-3 text-[0.92rem] font-medium text-amber-ink">⚠ {fake.map((c) => c.name).join(' and ')} still {fake.length > 1 ? 'have' : 'has'} a placeholder number. Enter the real number below, or guests will message a dead number.</p>}

      {(['groom', 'bride'] as const).map((side) => {
        const list = family.filter((c) => c.side === side);
        return (
          <section key={side} className="space-y-3">
            <h3 className="font-display text-[1.4rem]">{side === 'groom' ? 'Groom' : 'Bride'} side contact</h3>
            {list.map((c) => (
              <Card key={c.id} className={c.active ? '' : 'opacity-80'}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name shown to guests" error={err(c.id, 'name')}><Text value={c.name} onChange={(v) => set(c.id, (x) => ({ ...x, name: v }))} /></Field>
                  <PhoneField label="WhatsApp number (with country code)" value={c.phone} error={err(c.id, 'phone')}
                    onChange={(v) => set(c.id, (x) => ({ ...x, phone: v, placeholder: undefined }))} />
                </div>
                <Check label="Show to guests" checked={c.active} onChange={(v) => set(c.id, (x) => ({ ...x, active: v }))} />
                <details className="mt-1 rounded-xl border border-line px-3 py-2">
                  <summary className="min-h-9 cursor-pointer text-[0.9rem] font-semibold text-ink-2">More options</summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Handles" hint="Timings appears on event pages; both appear in the Help list."><Select value={c.role} options={[{ v: 'timings', label: 'Timings & everything' }, { v: 'stay-transport', label: 'Stay & transport' }]} onChange={(v) => set(c.id, (x) => ({ ...x, role: v }))} /></Field>
                    <Field label="Only for one city"><Select value={c.city ?? ''} options={[{ v: '', label: 'All events' }, 'Pune', 'Indore']} onChange={(v) => set(c.id, (x) => ({ ...x, city: v || undefined }))} /></Field>
                  </div>
                  <div className="mt-3"><L10nInput label="Relation to the family (optional, e.g. Brother)" value={c.relation} onChange={(v) => set(c.id, (x) => ({ ...x, relation: v }))} error={err(c.id, 'relation')} /></div>
                  <Check label="Default contact for this side" checked={!!c.primary} onChange={(v) => set(c.id, (x) => ({ ...x, primary: v || undefined }))} />
                  <Btn small kind="danger" className="mt-2" onClick={() => del(c.id)}>Delete this contact</Btn>
                </details>
              </Card>
            ))}
            {list.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-center text-ink-2">No contact for the {side} side yet, so guests on this side won’t see a Help button.</p>}
            <Btn small onClick={() => newContact(side)}>+ Add another {side}-side contact</Btn>
          </section>
        );
      })}

      <section className="space-y-3">
        <h3 className="font-display text-[1.4rem]">On-site help desk</h3>
        <p className="-mt-1 text-[0.9rem] text-ink-2">Shown on the Info page as tap-to-call buttons.</p>
        {venues.map((v) => (
          <Card key={v.id}>
            <L10nInput label="Name" required value={v.name} onChange={(n) => set(v.id, (x) => ({ ...x, name: n ?? { en: '' } }))} error={err(v.id, 'name')} />
            <div className="mt-3 space-y-2">
              {v.phones.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1"><PhoneField label={`Phone ${i + 1}`} value={p} error={i === 0 ? err(v.id, 'phones') : undefined}
                    onChange={(val) => set(v.id, (x) => ({ ...x, phones: (x as VenueContact).phones.map((q, j) => (j === i ? val : q)) }))} /></div>
                  <Btn small kind="danger" className="mt-6" aria-label={`Remove phone ${i + 1}`} onClick={() => set(v.id, (x) => ({ ...x, phones: (x as VenueContact).phones.filter((_, j) => j !== i) }))}>✕</Btn>
                </div>
              ))}
              <Btn small onClick={() => set(v.id, (x) => ({ ...x, phones: [...(x as VenueContact).phones, ''] }))}>+ Add number</Btn>
            </div>
            <Check label="Show to guests" checked={v.active} onChange={(a) => set(v.id, (x) => ({ ...x, active: a }))} />
            <Btn small kind="danger" onClick={() => del(v.id)}>Delete help desk</Btn>
          </Card>
        ))}
        <Btn small onClick={() => add({ id: uid('desk'), kind: 'venue', name: { en: 'Help desk' }, phones: [''], active: false })}>+ Add help desk</Btn>
      </section>
    </div>
  );
}
