import type { ReactNode } from 'react';

const W = 390, H = 82, ROPE = 7, SWAGS = 6, SPAN = W / SWAGS, SAG = 19;
const rope = '#7A5A22';
const f = (n: number) => +n.toFixed(2);

/** Point on the quadratic swag between junctions x0..x1 at t (0..1). */
const swag = (x0: number, t: number): [number, number] => {
  const y = ROPE + 2 * SAG * t * (1 - t);
  return [x0 + SPAN * t, y];
};

/** Mango leaf hanging from (0,0): pointed drop with a midrib and a tiny gold bead at the tip. */
function Leaf({ len, w, fill, rib }: { len: number; w: number; fill: string; rib: string }) {
  return (
    <>
      <path d={`M0 0C${f(w * 0.95)} ${f(len * 0.22)} ${f(w * 0.75)} ${f(len * 0.68)} 0 ${len}C${f(-w * 0.75)} ${f(len * 0.68)} ${f(-w * 0.95)} ${f(len * 0.22)} 0 0Z`} fill={fill} />
      <path d={`M0 1.5C.4 ${f(len * 0.4)} -.3 ${f(len * 0.7)} 0 ${f(len * 0.88)}`} stroke={rib} strokeWidth=".7" fill="none" strokeLinecap="round" />
      <circle cx="0" cy={len + 2.2} r="1.5" fill="#B8955A" />
    </>
  );
}

/** A hanging drop: sways about its own attach point. */
function Drop({ x, y, i, children }: { x: number; y: number; i: number; children: ReactNode }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)})`}>
      <g className="toran-sway" style={{ animationDuration: `${4 + ((i * 7) % 5) * 0.5}s`, animationDelay: `${-((i * 1.3) % 4.5)}s` }}>{children}</g>
    </g>
  );
}

/** Traditional door garland: marigold swags with mango-leaf drops. Decorative only. */
export function Toran() {
  const flowers: ReactNode[] = [];
  const drops: ReactNode[] = [];
  const strings: string[] = [];
  let k = 0;
  for (let s = 0; s < SWAGS; s++) {
    const x0 = s * SPAN, x1 = x0 + SPAN;
    strings.push(`M${f(x0)} ${ROPE}Q${f(x0 + SPAN / 2)} ${f(ROPE + 2 * SAG)} ${f(x1)} ${ROPE}`);
    // flowers along the swag, leaving the middle free for a hanging leaf
    [0.14, 0.31, 0.69, 0.86].forEach((t, j) => {
      const [x, y] = swag(x0, t);
      const alt = (s + j) % 2 === 0;
      const sc = 1.12 + (((s * 5 + j * 3) % 4) * 0.07);
      flowers.push(<use key={`f${k++}`} href={alt ? '#tor-fo' : '#tor-fy'} transform={`translate(${f(x)} ${f(y + 1.5)}) rotate(${(s * 37 + j * 53) % 360}) scale(${f(sc)})`} />);
    });
    // short leaf hanging from the swag's lowest point
    const [mx, my] = swag(x0, 0.5);
    drops.push(
      <Drop key={`m${s}`} x={mx} y={my + 2} i={s * 2 + 1}>
        <Leaf len={27} w={6.4} fill={s % 2 ? '#3E7B3A' : '#5C9A45'} rib="#2C5A2A" />
      </Drop>,
    );
  }
  // long leaf + a flower at every junction (including both edges)
  for (let s = 0; s <= SWAGS; s++) {
    const x = s * SPAN;
    drops.push(
      <Drop key={`j${s}`} x={x} y={ROPE + 5} i={s * 2}>
        <Leaf len={42 + (s % 2) * 6} w={8.4} fill={s % 2 ? '#5C9A45' : '#3E7B3A'} rib="#2C5A2A" />
        <use href={s % 2 ? '#tor-fy' : '#tor-fo'} transform="translate(0 -1) scale(1.35)" />
      </Drop>,
    );
  }
  const ring = (n: number, r: number, pr: number, fill: string, stroke: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <circle key={i} cx={f(Math.cos(a) * r)} cy={f(Math.sin(a) * r)} r={pr} fill={fill} stroke={stroke} strokeWidth=".35" />;
    });
  return (
    <div aria-hidden="true" className="toran-drop pointer-events-none absolute inset-x-0 top-0 z-[5] mx-auto max-w-[520px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" style={{ filter: 'drop-shadow(0 2px 3px rgb(20 8 12 / .35))' }}>
        <defs>
          <g id="tor-fo">{ring(9, 4.7, 3.7, '#F28C28', '#C96A12')}{ring(7, 2.7, 2.6, '#F6B93B', '#E49A1E')}<circle r="1.7" fill="#F28C28" /></g>
          <g id="tor-fy">{ring(9, 4.7, 3.7, '#F6B93B', '#D9951C')}{ring(7, 2.7, 2.6, '#FBCF63', '#E9A92B')}<circle r="1.7" fill="#F28C28" /></g>
        </defs>
        <path d={`M0 ${ROPE}H${W}`} stroke={rope} strokeWidth="2.4" />
        {strings.map((d, i) => <path key={i} d={d} stroke={rope} strokeWidth="1.1" fill="none" />)}
        {drops}
        {flowers}
      </svg>
    </div>
  );
}
