import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { validateContent } from '../../shared/validate';
import { builtIn, type Content } from '../lib/data';
import { ApiError, api, clearToken, getToken, setToken, type HistoryItem } from './api';
import { ContactsTab } from './ContactsTab';
import { summarize } from './diff';
import { EventsTab } from './EventsTab';
import { HistoryTab } from './HistoryTab';
import { InfoTab } from './InfoTab';
import { JsonTab } from './JsonTab';
import { NoticesTab } from './NoticesTab';
import { ToolsTab } from './ToolsTab';
import { Btn, Card, Field, Modal, Text, istStamp } from './ui';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const TABS = [['events', 'Events'], ['notices', 'Notices'], ['tools', 'Shift times'], ['contacts', 'Contacts'], ['info', 'Venue & names'], ['history', 'History'], ['json', 'Advanced']] as const;
type Tab = (typeof TABS)[number][0];

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Admin — Rajat & Paridhi';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);
  const [authed, setAuthed] = useState(() => !!getToken());
  return (
    <div className="min-h-dvh bg-ivory text-ink">
      {authed ? <Editor onLogout={() => { clearToken(); setAuthed(false); }} /> : <Login onDone={() => setAuthed(true)} />}
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [u, setU] = useState(''), [p, setP] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { setToken((await api.login(u, p)).token); onDone(); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <h1 className="font-display text-[2.4rem] leading-tight">Admin</h1>
      <p className="mb-6 text-ink-2">Rajat & Paridhi — itinerary editor</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username"><Text autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={u} onChange={setU} /></Field>
        <Field label="Password"><Text type="password" autoComplete="current-password" value={p} onChange={setP} /></Field>
        {err && <p role="alert" className="font-medium text-bride-ink">{err}</p>}
        <Btn kind="primary" type="submit" className="w-full" disabled={busy || !u || !p}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
      </form>
    </main>
  );
}

function Editor({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('events');
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [rev, setRev] = useState(0);
  const [at, setAt] = useState<string | null>(null);
  const [usingBuiltIn, setUsingBuiltIn] = useState(true);
  const [base, setBase] = useState<Content>(() => clone(builtIn));
  const [draft, setDraftRaw] = useState<Content>(() => clone(builtIn));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');
  const [pubErr, setPubErr] = useState('');
  const [conflict, setConflict] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setLoadErr('');
    try {
      const s = await api.state();
      const c = clone(s.content ?? builtIn);
      setRev(s.rev); setAt(s.at); setUsingBuiltIn(!s.content); setBase(c); setDraftRaw(clone(c)); setHistory(s.history); setConflict(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) { onLogout(); return; }
      setLoadErr((e as Error).message);
    } finally { setLoading(false); }
  }, [onLogout]);
  useEffect(() => { void load(); }, [load]);

  const setDraft = useCallback((f: (d: Content) => Content) => setDraftRaw((d) => f(d)), []);
  const dirty = useMemo(() => JSON.stringify(base) !== JSON.stringify(draft), [base, draft]);
  const issues = useMemo(() => { const r = validateContent(draft); return r.ok ? [] : r.issues; }, [draft]);
  const changes = useMemo(() => (review ? summarize(base, draft) : []), [review, base, draft]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 6000); return () => clearTimeout(t); }, [toast]);

  const guarded = async (fn: () => Promise<void>) => {
    setBusy(true); setPubErr('');
    try { await fn(); } catch (e) {
      if (e instanceof ApiError && e.status === 401) { onLogout(); return; }
      if (e instanceof ApiError && e.status === 409) setConflict(true);
      setPubErr((e as Error).message);
    } finally { setBusy(false); }
  };

  const publish = () => guarded(async () => {
    const r = await api.publish(rev, draft, note.trim() || changes.slice(0, 3).join(' · ') || 'Edited');
    setReview(false); setNote('');
    await load();
    setToast(`Published as version ${r.rev}. New visitors see it within about a minute; guests with the app open pick it up within ~3 minutes or the next time they open it.`);
  });
  const restore = (r: number) => guarded(async () => { await api.restore(r); await load(); setToast(`Restored version ${r} as a new version.`); setTab('events'); });
  const reset = () => guarded(async () => { await api.reset(rev); await load(); setToast('Reset to the built-in data.'); setTab('events'); });
  const backup = () => {
    const blob = new Blob([JSON.stringify(base, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `wedding-site-backup-v${rev}.json`; a.click(); URL.revokeObjectURL(a.href);
  };

  if (loading) return <p className="p-8 text-center text-ink-2">Loading…</p>;
  if (loadErr) return (
    <main className="mx-auto max-w-md p-6 text-center">
      <p role="alert" className="mb-4 font-medium text-bride-ink">{loadErr}</p>
      <div className="flex justify-center gap-2"><Btn kind="primary" onClick={load}>Try again</Btn><Btn onClick={onLogout}>Sign out</Btn></div>
    </main>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-40 pt-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[2rem] leading-tight">Admin</h1>
          <p className="text-[0.85rem] text-ink-2">{usingBuiltIn ? 'Nothing published from here yet' : `Live: version ${rev} · ${istStamp(at)} IST`}</p>
        </div>
        <div className="flex gap-2"><a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-line bg-white px-4 text-[0.9rem] font-semibold">View site ↗</a><Btn small onClick={onLogout}>Sign out</Btn></div>
      </header>

      <nav aria-label="Sections" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} aria-current={tab === k ? 'page' : undefined}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-[0.9rem] font-semibold ${tab === k ? 'border-oxblood bg-oxblood text-white' : 'border-line bg-white text-ink'}`}>{label}</button>
        ))}
      </nav>

      {conflict && (
        <Card className="mb-4 border-bride">
          <p className="mb-2 font-medium text-bride-ink">Someone else published a newer version while you were editing. Publishing is blocked so their changes aren’t overwritten.</p>
          <Btn small kind="danger" onClick={() => { if (window.confirm('Discard your unpublished edits and load the latest version?')) void load(); }}>Discard my edits & load latest</Btn>
        </Card>
      )}

      {tab === 'events' && <EventsTab draft={draft} setDraft={setDraft} issues={issues} />}
      {tab === 'notices' && <NoticesTab draft={draft} setDraft={setDraft} issues={issues} />}
      {tab === 'tools' && <ToolsTab draft={draft} setDraft={setDraft} onDone={(m) => { setToast(m); setTab('events'); }} />}
      {tab === 'contacts' && <ContactsTab draft={draft} setDraft={setDraft} issues={issues} />}
      {tab === 'info' && <InfoTab draft={draft} setDraft={setDraft} issues={issues} />}
      {tab === 'history' && <HistoryTab history={history} rev={rev} dirty={dirty} usingBuiltIn={usingBuiltIn} busy={busy} onRestore={restore} onReset={reset} onBackup={backup} />}
      {tab === 'json' && <JsonTab draft={draft} apply={(c) => { setDraftRaw(clone(c)); setToast('Applied to draft. Review and publish when ready.'); setTab('events'); }} />}

      {toast && <p role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-xl bg-ink p-3 text-[0.9rem] text-white shadow-lg">{toast}</p>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="min-w-0 flex-1 text-[0.88rem] leading-snug">
            {issues.length > 0 ? <span className="font-medium text-bride-ink">{issues.length} thing{issues.length > 1 ? 's' : ''} to fix before you can publish</span>
              : dirty ? <span className="font-medium text-amber-ink">Unpublished changes</span> : <span className="text-ink-2">No changes</span>}
          </p>
          {dirty && <Btn small onClick={() => { if (window.confirm('Throw away all unpublished edits?')) setDraftRaw(clone(base)); }}>Discard</Btn>}
          <Btn kind="primary" small disabled={!dirty || issues.length > 0 || conflict} onClick={() => { setPubErr(''); setReview(true); }}>Review & publish</Btn>
        </div>
      </div>

      {review && (
        <Modal title="Publish these changes?" onClose={() => !busy && setReview(false)}>
          <ul className="mb-4 max-h-[40dvh] list-disc space-y-1 overflow-y-auto pl-5 text-[0.92rem]">
            {changes.map((c, i) => <li key={i} className="break-words">{c}</li>)}
            {changes.length === 0 && <li>Minor edits</li>}
          </ul>
          <Field label="Note for the history (optional)"><Text value={note} onChange={setNote} placeholder="e.g. Baraat delayed 1 hour" maxLength={200} /></Field>
          {pubErr && <p role="alert" className="mt-3 font-medium text-bride-ink">{pubErr}</p>}
          <div className="mt-4 flex gap-2"><Btn kind="primary" className="flex-1" disabled={busy} onClick={publish}>{busy ? 'Publishing…' : 'Publish to guests'}</Btn><Btn disabled={busy} onClick={() => setReview(false)}>Back</Btn></div>
        </Modal>
      )}
    </div>
  );
}
