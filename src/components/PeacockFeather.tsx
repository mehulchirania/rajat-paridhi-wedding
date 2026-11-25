const GOLD = '#B8955A';

/** Thin gold line-art mor pankh lying on its side. Draws itself, then the eye fades in. Decorative. */
export function PeacockFeather({ className = '' }: { className?: string }) {
  const y = (x: number) => 21 - (x - 10) * 0.012; // shaft rises very slightly towards the eye
  const barbs: string[] = [];
  for (let x = 26; x <= 96; x += 5) {
    const len = 4 + ((x - 26) / 70) * 6;
    barbs.push(`M${x} ${y(x).toFixed(2)}l${(len * 0.8).toFixed(1)} ${(-len).toFixed(1)}`, `M${x} ${y(x).toFixed(2)}l${(len * 0.8).toFixed(1)} ${len.toFixed(1)}`);
  }
  const line = { stroke: GOLD, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' as const, pathLength: 1 };
  return (
    <svg aria-hidden="true" viewBox="0 0 160 42" className={`block h-auto w-[140px] ${className}`}>
      <path className="feather-line" {...line} d="M4 22.5C30 22 62 21 112 20.4" />
      {barbs.map((d, i) => <path key={i} className="feather-line" {...line} strokeWidth=".8" strokeOpacity=".9" d={d} />)}
      <path className="feather-line" {...line} strokeWidth="1.1" d="M92 20.5C100 7 138 3 154 21C138 39 100 34 92 20.5Z" />
      <g className="feather-eye">
        <ellipse cx="127" cy="20.8" rx="12.5" ry="9.2" fill="none" stroke={GOLD} strokeWidth=".9" />
        <ellipse cx="127" cy="20.8" rx="9.2" ry="6.6" fill="#1F6F78" stroke={GOLD} strokeWidth=".7" />
        <ellipse cx="127" cy="20.8" rx="4.6" ry="3.3" fill="#2E9AA3" />
        <ellipse cx="127" cy="20.8" rx="2" ry="1.5" fill="#143F45" />
        <circle cx="126.2" cy="20" r=".6" fill={GOLD} />
      </g>
    </svg>
  );
}
