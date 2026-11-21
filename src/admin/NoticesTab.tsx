import type { Issue } from '../../shared/validate';
import type { Content } from '../lib/data';
import { Btn, Card, Check, L10nInput, uid } from './ui';

interface P { draft: Content; setDraft: (f: (d: Content) => Content) => void; issues: Issue[] }

export function NoticesTab({ draft, setDraft, issues }: P) {
  const list = draft.meta.announcements;
  const set = (f: (a: typeof list) => typeof list) => setDraft((d) => ({ ...d, meta: { ...d.meta, announcements: f(d.meta.announcements) } }));
  const firstActive = list.findIndex((a) => a.active);
  const move = (i: number, by: number) => set((a) => { const n = [...a]; const j = i + by; if (j < 0 || j >= n.length) return a; [n[i], n[j]] = [n[j], n[i]]; return n; });
  return (
    <div className="space-y-4">
      <p className="text-[0.92rem] text-ink-2">Guests see <b>one</b> banner on every day page: the <b>first active</b> notice in this list. Use it for “Baraat running 1 hour late”-type updates. Each guest can dismiss a notice; <b>Show again to everyone</b> makes it reappear for those who did.</p>
      <Btn kind="primary" small onClick={() => set((a) => [{ id: uid('notice'), active: true, text: { en: '' } }, ...a])}>+ New notice (goes to the top)</Btn>
      {list.map((a, i) => {
        const e = issues.find((x) => x.path.startsWith(`meta.announcements.${a.id}`))?.msg;
        return (
          <Card key={a.id} className={a.active && i === firstActive ? 'border-champagne' : ''}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[0.8rem] font-semibold text-ink-2">{a.active ? (i === firstActive ? '● Showing to guests' : '○ Active, but hidden behind a notice above') : '○ Off'}</span>
              <span className="flex gap-1">
                <Btn small aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</Btn>
                <Btn small aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</Btn>
              </span>
            </div>
            <L10nInput label="Message" multiline required value={a.text} error={e} onChange={(v) => set((l) => l.map((x, j) => (j === i ? { ...x, text: v ?? { en: '' } } : x)))} />
            <Check label="Active" checked={a.active} onChange={(v) => set((l) => l.map((x, j) => (j === i ? { ...x, active: v } : x)))} />
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn small onClick={() => set((l) => l.map((x, j) => (j === i ? { ...x, id: uid('notice') } : x)))}>Show again to everyone</Btn>
              <Btn small kind="danger" onClick={() => set((l) => l.filter((_, j) => j !== i))}>Delete</Btn>
            </div>
          </Card>
        );
      })}
      {list.length === 0 && <p className="py-6 text-center text-ink-2">No notices.</p>}
    </div>
  );
}
