import type { Swatch as S } from '../types';

const STYLE: Record<S, React.CSSProperties> = {
  lehariya: { background: 'repeating-linear-gradient(135deg,#B83265 0 4px,#E8A33D 4px 8px,#2E8B6E 8px 12px,#2B5FA8 12px 16px,#7B3FA0 16px 20px)' },
  purple: { background: '#7B3FA0' },
  pastel: { backgroundColor: '#FFF4EC', backgroundImage: 'radial-gradient(#F4A9BE 22%,transparent 24%),radial-gradient(#A9D8C2 22%,transparent 24%),radial-gradient(#B9B0EA 22%,transparent 24%)', backgroundSize: '8px 8px', backgroundPosition: '0 0,4px 2px,2px 5px' },
  'indo-western': { background: 'linear-gradient(135deg,#1F3A5F 50%,#C9A24B 50%)' },
  traditional: { background: '#5E1426', boxShadow: 'inset 0 0 0 2.5px #B8955A' },
  any: { background: '#FBF7F1', border: '1.5px dashed #7A5A22' },
};

/** Small colour chip for a dress code. Quiet: one hairline ring, no fill beyond the colour itself. */
export function Swatch({ kind, size = 16 }: { kind: S; size?: number }) {
  return (
    <span aria-hidden="true" className="inline-block shrink-0 rounded-full ring-1 ring-inset ring-black/15"
      style={{ width: size, height: size, ...STYLE[kind] }} />
  );
}
