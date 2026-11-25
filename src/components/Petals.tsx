import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../lib/motion';

export type PetalsMode = 'drift' | 'burst' | 'shower';

export interface PetalsProps {
  /** drift: slow ambient fall inside the nearest positioned parent. burst: radial pop from `origin`. shower: one full-screen fall. */
  mode: PetalsMode;
  /** Number of petals. Defaults: drift 10, burst 14, shower 24. */
  count?: number;
  /** drift: how long new falls keep starting (default 40000). burst: flight time (default 700). shower: whole show (default 5000). */
  durationMs?: number;
  /** burst only: viewport (client) coordinates the petals fly out from. Defaults to screen centre. */
  origin?: { x: number; y: number };
  /** Called once when the last petal has finished (immediately under reduced motion, when nothing renders). */
  onDone?: () => void;
}

const COLORS = ['#F28C28', '#F6B93B', '#E0607E', '#B3263B'];
const SHAPES = [
  'M10 1C15 6 17 12 10 19 3 12 5 6 10 1Z',                    // marigold teardrop
  'M3 11C2 5 8 2 12 3 17 4 19 9 15 15 11 19 4 17 3 11Z',      // rounded rose petal
  'M2 4C10 0 18 6 18 16 12 10 7 9 2 4Z',                      // slender curl
];

interface Spec { color: string; shape: number; size: number; style: CSSProperties; end: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function build(mode: PetalsMode, count: number, D: number, origin?: { x: number; y: number }): Spec[] {
  return Array.from({ length: count }, (_, i) => {
    const color = pick(COLORS);
    const shape = i % SHAPES.length;
    const size = Math.round(rnd(12, 21));
    const vars: Record<string, string | number> = { '--rot': `${Math.round(rnd(200, 520) * (Math.random() < 0.5 ? -1 : 1))}deg`, '--sway': `${Math.round(rnd(10, 26))}px`, '--sway-dur': `${rnd(2.8, 4.6).toFixed(2)}s` };
    let dur: number, delay: number, iter = 1;
    if (mode === 'drift') {
      dur = rnd(15000, 25000);
      delay = (i / count) * dur * 0.9 + rnd(0, 1500);           // staggered so they never arrive as a curtain
      iter = Math.max(1, Math.ceil((D - delay) / dur));            // stop starting new falls after D
      Object.assign(vars, { '--left': `${rnd(2, 96).toFixed(1)}%`, '--drift': `${Math.round(rnd(-50, 50))}px`, '--op': rnd(0.55, 0.8).toFixed(2) });
    } else if (mode === 'shower') {
      dur = rnd(0.55, 0.78) * D;
      delay = rnd(0, D - dur);
      Object.assign(vars, { '--left': `${rnd(0, 98).toFixed(1)}%`, '--drift': `${Math.round(rnd(-70, 70))}px`, '--op': rnd(0.8, 1).toFixed(2) });
    } else {
      const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05);             // upward fan, gravity pulls them down
      const dist = rnd(50, 130);
      dur = D * rnd(0.85, 1);
      delay = rnd(0, 40);
      Object.assign(vars, { '--left': `${origin?.x ?? 0}px`, '--top': `${origin?.y ?? 0}px`, '--x': `${Math.round(Math.cos(a) * dist * 1.1)}px`, '--y': `${Math.round(Math.sin(a) * dist)}px` });
    }
    return {
      color, shape, size, end: delay + dur * iter,
      style: { ...vars, '--dur': `${Math.round(dur)}ms`, '--delay': `${Math.round(delay)}ms`, '--iter': iter, width: size, height: size } as CSSProperties,
    };
  });
}

/**
 * Falling / bursting marigold and rose petals. Pure CSS animation, no canvas.
 * drift sits inside its positioned parent (behind later siblings); burst and shower are fixed to the viewport.
 * Renders nothing under prefers-reduced-motion. Unmounts itself when finished.
 */
export function Petals({ mode, count, durationMs, origin, onDone }: PetalsProps) {
  const n = count ?? (mode === 'drift' ? 10 : mode === 'burst' ? 14 : 24);
  const D = durationMs ?? (mode === 'drift' ? 40000 : mode === 'burst' ? 700 : 5000);
  const [reduced] = useState(prefersReducedMotion);
  const [specs] = useState(() => (reduced ? [] : build(mode, n, D, origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 })));
  const [done, setDone] = useState(reduced);
  const layer = useRef<HTMLDivElement>(null);
  const cb = useRef(onDone);
  useEffect(() => { cb.current = onDone; });

  useEffect(() => {
    const fin = () => { setDone(true); cb.current?.(); };
    if (reduced) { fin(); return; }
    const timer = setTimeout(fin, Math.max(...specs.map((s) => s.end)) + 100);
    const vis = () => { if (layer.current) layer.current.dataset.paused = String(document.hidden); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', vis); };
  }, [reduced, specs]);

  if (done) return null;
  const pos = mode === 'drift' ? 'absolute inset-0' : 'fixed inset-0 z-40';
  return (
    <div ref={layer} aria-hidden="true" className={`petal-layer pointer-events-none overflow-hidden ${pos}`}>
      {specs.map((s, i) => (
        <span key={i} className={`petal petal-${mode}`} style={s.style}>
          <svg viewBox="0 0 20 20" width="100%" height="100%" className="petal-sway block" fill={s.color}>
            <path d={SHAPES[s.shape]} />
            <path d="M10 4V16" stroke="#000" strokeOpacity=".12" strokeWidth=".8" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  );
}
