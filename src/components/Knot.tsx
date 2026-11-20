export function Knot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} role="img" aria-label="Two threads tied in a knot" fill="none" strokeLinecap="round">
      <path className="knot-strand" pathLength={420} d="M12 100C55 100 80 22 122 40C152 53 140 92 104 80" stroke="#6FA0E8" strokeWidth="6" />
      <path className="knot-strand b" pathLength={420} d="M188 100C145 100 120 22 78 40C48 53 60 92 96 80" stroke="#F08FB4" strokeWidth="6" />
      <circle className="knot-dot" cx="100" cy="62" r="9" fill="#C9A24B" stroke="#F7EFE3" strokeWidth="2.500" />
    </svg>
  );
}
