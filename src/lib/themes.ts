/** Colour themes. Palettes live in src/index.css as html[data-theme='…'] blocks; this is the picker metadata. */
export type Theme = 'light' | 'rose' | 'haldi' | 'sage' | 'peacock' | 'dark' | 'midnight';

export const THEMES: { id: Theme; dark: boolean; bg: string; accent: string; ink: string }[] = [
  { id: 'light', dark: false, bg: '#FBF7F1', accent: '#5E1426', ink: '#1E1416' },
  { id: 'rose', dark: false, bg: '#FFF8F8', accent: '#A32A52', ink: '#2A1519' },
  { id: 'haldi', dark: false, bg: '#FFFBEF', accent: '#9A4A0B', ink: '#231B0E' },
  { id: 'sage', dark: false, bg: '#F6F8F2', accent: '#1F5A44', ink: '#14201A' },
  { id: 'peacock', dark: false, bg: '#F3F8F9', accent: '#0F5C6E', ink: '#0F1E24' },
  { id: 'dark', dark: true, bg: '#171113', accent: '#7A2238', ink: '#F2E9E4' },
  { id: 'midnight', dark: true, bg: '#0E1220', accent: '#3B4FA3', ink: '#E9ECF6' },
];

export const isTheme = (v: string | null): v is Theme => !!v && THEMES.some((t) => t.id === v);
export const isDarkTheme = (t: Theme) => THEMES.find((x) => x.id === t)?.dark ?? false;

/** Apply a theme to <html>: palette attribute, dark class, and the browser-bar colour. */
export function applyTheme(t: Theme) {
  const d = document.documentElement;
  if (t === 'light') d.removeAttribute('data-theme'); else d.setAttribute('data-theme', t);
  d.classList.toggle('dark', isDarkTheme(t));
  const accent = THEMES.find((x) => x.id === t)?.accent;
  if (accent) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', accent);
}
