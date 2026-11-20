// localStorage can throw (private mode, blocked cookies). Fall back to memory silently.
const mem = new Map<string, string>();
export const store = {
  get(k: string): string | null {
    try { return window.localStorage.getItem(k); } catch { return mem.get(k) ?? null; }
  },
  set(k: string, v: string) {
    try { window.localStorage.setItem(k, v); } catch { mem.set(k, v); }
  },
};
