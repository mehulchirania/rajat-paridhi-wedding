/** True when the guest asked their device for reduced motion. Safe to call on every render. */
export const prefersReducedMotion = (): boolean => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};
