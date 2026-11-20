import { useState } from 'react';
import type { HistoryItem } from './api';
import { Btn, Card, istStamp } from './ui';

interface P { history: HistoryItem[]; rev: number; dirty: boolean; usingBuiltIn: boolean; busy: boolean; onRestore: (rev: number) => void; onReset: () => void; onBackup: () => void }

export function HistoryTab({ history, rev, dirty, usingBuiltIn, busy, onRestore, onReset, onBackup }: P) {
  const [confirm, setConfirm] = useState<number | 'reset' | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-[0.92rem] text-ink-2">Every publish is kept. Restoring an old version publishes it again as a <b>new</b> version, so nothing is ever lost.{dirty && <b className="text-bride-ink"> You have unpublished edits — restoring will discard them.</b>}</p>
      <div className="flex flex-wrap gap-2">
        <Btn small onClick={onBackup}>Download backup (JSON)</Btn>
        {confirm === 'reset'
          ? <><Btn small kind="danger" disabled={busy || usingBuiltIn} onClick={() => { setConfirm(null); onReset(); }}>Yes, reset to built-in</Btn><Btn small onClick={() => setConfirm(null)}>Cancel</Btn></>
          : <Btn small kind="danger" disabled={usingBuiltIn} onClick={() => setConfirm('reset')}>Reset to built-in data…</Btn>}
      </div>
      {usingBuiltIn && <p className="text-[0.9rem] text-ink-2">Nothing has been published from this portal yet — guests currently see the data that shipped with the site.</p>}
      {history.map((h) => (
        <Card key={h.rev}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">Version {h.rev}{h.rev === rev && <span className="ml-2 rounded-full bg-amber-soft px-2 py-0.5 text-[0.75rem] text-amber-ink">live</span>}</p>
              <p className="text-[0.85rem] text-ink-2">{istStamp(h.at)} IST · {h.kind}</p>
              <p className="mt-1 whitespace-pre-line break-words text-[0.92rem]">{h.note}</p>
            </div>
            {h.rev !== rev && (confirm === h.rev
              ? <span className="flex shrink-0 flex-col gap-1"><Btn small kind="danger" disabled={busy} onClick={() => { setConfirm(null); onRestore(h.rev); }}>Restore</Btn><Btn small onClick={() => setConfirm(null)}>Cancel</Btn></span>
              : <Btn small className="shrink-0" onClick={() => setConfirm(h.rev)}>Restore…</Btn>)}
          </div>
        </Card>
      ))}
      {history.length === 0 && <p className="py-6 text-center text-ink-2">No versions yet.</p>}
    </div>
  );
}
