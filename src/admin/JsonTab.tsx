import { useState } from 'react';
import { validateContent, type Issue } from '../../shared/validate';
import type { Content } from '../lib/data';
import { Btn } from './ui';

interface P { draft: Content; apply: (c: Content) => void }

/** Escape hatch for anything the forms don't cover. Same validation as publishing. */
export function JsonTab({ draft, apply }: P) {
  const [text, setText] = useState(() => JSON.stringify(draft, null, 2));
  const [issues, setIssues] = useState<Issue[]>([]);
  const [parseErr, setParseErr] = useState('');
  const run = () => {
    setParseErr(''); setIssues([]);
    let v: unknown;
    try { v = JSON.parse(text); } catch (e) { return setParseErr(`Not valid JSON: ${(e as Error).message}`); }
    const r = validateContent(v);
    if (!r.ok) return setIssues(r.issues);
    apply(r.content as unknown as Content);
  };
  return (
    <div className="space-y-3">
      <p className="text-[0.92rem] text-ink-2">Advanced: edit everything as raw data (<code>events</code>, <code>contacts</code>, <code>meta</code>). “Apply to draft” checks it first; you still review and publish as usual.</p>
      <textarea aria-label="Raw JSON" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} rows={22} className="block w-full rounded-xl border border-line bg-paper p-3 font-mono text-[0.8rem] leading-snug" />
      {parseErr && <p role="alert" className="text-bride-ink">{parseErr}</p>}
      {issues.length > 0 && <ul role="alert" className="list-disc space-y-1 pl-5 text-[0.88rem] text-bride-ink">{issues.slice(0, 20).map((i, n) => <li key={n}><code>{i.path}</code> — {i.msg}</li>)}</ul>}
      <div className="flex gap-2"><Btn kind="primary" small onClick={run}>Apply to draft</Btn><Btn small onClick={() => { setText(JSON.stringify(draft, null, 2)); setIssues([]); setParseErr(''); }}>Reload from draft</Btn></div>
    </div>
  );
}
