import type { Swatch as S } from '../types';

const STYLE: Record<S, React.CSSProperties> = {
  lehariya: { background: 'repeating-linear-gradient(135deg,#B83265 0 5px,#E8A33D 5px 10px,#2E8B6E 10px 15px,#2B5FA8 15px 20px,#7B3FA0 20px 25px)' },
  purple: { background: '#7B3FA0' },
  pastel: { backgroundColor: '#FFF4EC', backgroundImage: 'radial-gradient(#F4A9BE 22%,transparent 24%),radial-gradient(#A9D8C2 22%,transparent 24%),radial-gradient(#B9B0EA 22%,transparent 24%)', backgroundSize: '12px 12px', backgroundPosition: '0 0,6px 3px,3px 8px' },
  'indo-western': { background: 'linear-gradient(135deg,#1F3A5F 50%,#C9A24B 50%)' },
  traditional: { background: '#6B1A2F', boxShadow: 'inset 0 0 0 3px #C9A24B' },
  any: { background: '#FFFBF4', border: '2px dashed #7A5B14' },
};

export function Swatch({ kind, size = 28 }: { kind: S; size?: number }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/15 text-[10px] text-gold-dark"
      style={{ width: size, height: size, ...STYLE[kind] }}>
      {kind === 'any' ? '✦' : ''}
    </span>
  );
}
