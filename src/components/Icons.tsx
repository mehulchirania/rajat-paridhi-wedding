import type { ReactNode } from 'react';
import type { EventItem } from '../types';

const P: Record<string, ReactNode> = {
  pooja: <><path d="M12 2.5c1.6 2.3 2.6 3.7 2.6 5.3a2.6 2.6 0 0 1-5.2 0c0-1.600 1-3 2.6-5.300z" /><path d="M3.5 12.500h17c0 4.200-3.800 7.500-8.500 7.500s-8.500-3.300-8.500-7.500z" /></>,
  kumkum: <><circle cx="12" cy="12" r="8.500" /><circle cx="12" cy="12" r="3" fill="currentColor" /></>,
  mehendi: <path d="M12 2.500c5.500 3.500 6.500 9.500 1.500 14.500-3 3-7.500 3-8.500 1 0-3 2-5 4.500-6-1.200-3.200-.2-6.500 2.500-9.500z" />,
  rakhi: <><circle cx="12" cy="9" r="6" strokeDasharray="2.200 2" /><path d="M12 15v6M9.500 15l-1.500 5.500M14.500 15l1.500 5.500" /></>,
  haldi: <><circle cx="12" cy="12" r="2.600" /><path d="M12 9.400C10.500 6 10.800 3.500 12 2.500c1.200 1 1.500 3.500 0 6.900zM14.600 12c3.400-1.500 5.900-1.200 6.900 0-1 1.200-3.500 1.500-6.900 0zM12 14.600c1.500 3.400 1.200 5.900 0 6.900-1.200-1-1.500-3.500 0-6.900zM9.400 12C6 13.500 3.500 13.200 2.500 12c1-1.200 3.500-1.500 6.900 0z" /></>,
  carnival: <><ellipse cx="12" cy="9.500" rx="5.500" ry="6.500" /><path d="M12 16l-1.500 2h3zM12 18c-1.500 2 1.500 3 0 5" /></>,
  mayra: <><path d="M8 8h8l1.200 3c0 5-2 9-5.200 9S6.800 16 6.800 11z" /><path d="M9 8c0-2 1-3 3-3s3 1 3 3" /></>,
  ring: <><circle cx="12" cy="15" r="5.500" /><path d="M9 6.500 12 3l3 3.500-3 3z" /></>,
  music: <><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></>,
  nikasi: <><path d="M5.500 21V10.500a6.500 6.500 0 0 1 13 0V21" /><path d="M9 21v-5M15 21v-5" /></>,
  meet: <><circle cx="9" cy="12" r="5.500" /><circle cx="15" cy="12" r="5.500" /></>,
  garland: <path d="M3.500 6c0 9 3.500 14 8.500 14s8.500-5 8.500-14" strokeWidth="3.500" strokeDasharray="0.1 4.500" />,
  phere: <path d="M12 2.500c3.500 4 5.500 6.500 5.500 10.500a5.500 5.500 0 0 1-11 0c0-2.200 1-3.500 2.500-4.500 0 2 1 3 2.200 3-.2-4-1.200-6.500.8-9z" />,
  reception: <path d="m12 2.500 2.200 6.300 6.300 2.200-6.300 2.200L12 19.500l-2.200-6.300L3.500 11l6.300-2.200z" />,
  travel: <><path d="M4 16V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8" /><path d="M3.500 16h17v2.500h-17z" /><path d="M4 11h16" /><circle cx="8" cy="18.500" r="1.300" /><circle cx="16" cy="18.500" r="1.300" /></>,
  meal: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></>,
  tea: <><path d="M4.500 9.500h11v4.500a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M15.500 10.500h2a2.200 2.200 0 0 1 0 4.400h-2M8 3.500c0 1.500 1.500 1.500 0 3.500M12 3.500c0 1.500 1.500 1.500 0 3.500" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><circle cx="12" cy="7.500" r=".6" fill="currentColor" /></>,
  pin: <><path d="M12 21s7-6.200 7-11.500a7 7 0 0 0-14 0C5 14.800 12 21 12 21z" /><circle cx="12" cy="9.500" r="2.500" /></>,
  cal: <><rect x="3.500" y="5" width="17" height="15.500" rx="2" /><path d="M3.500 10h17M8 3v4M16 3v4" /></>,
  whatsapp: <><path d="M12 3a9 9 0 0 0-7.800 13.500L3 21l4.600-1.200A9 9 0 1 0 12 3z" /><path d="M9 7.800c-.6.700-.8 1.700-.2 2.900a9.300 9.300 0 0 0 4.500 4.300c1.200.5 2.200.2 2.800-.5.200-.3.100-.6-.2-.8l-1.500-.8c-.3-.1-.5 0-.7.200l-.5.600a5 5 0 0 1-2.600-2.600l.600-.5c.2-.2.300-.4.200-.7l-.7-1.500c-.2-.3-.5-.4-.8-.2z" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /></>,
  share: <><circle cx="6" cy="12" r="2.500" /><circle cx="18" cy="6" r="2.500" /><circle cx="18" cy="18" r="2.500" /><path d="m8.200 10.800 7.600-3.600M8.200 13.200l7.600 3.600" /></>,
  x: <path d="M5 5l14 14M19 5 5 19" />,
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  left: <path d="M15 5l-7 7 7 7" />,
  right: <path d="M9 5l7 7-7 7" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  image: <><rect x="3.500" y="4.500" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.800" /><path d="m4 18 5-5 4 3 3-3 4 4" /></>,
};

export function Icon({ name, size = 22, className = '', title }: { name: string; size?: number; className?: string; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round"
      className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      {P[name] ?? P.info}
    </svg>
  );
}

export function eventIconName(ev: EventItem): string {
  if (ev.icon && P[ev.icon]) return ev.icon;
  return ev.type === 'meal' ? 'meal' : ev.type === 'celebration' ? 'reception' : 'pooja';
}

/** Colour theme per icon: soft tint for the chip + a readable ink on that tint. */
const THEME: Record<string, { bg: string; ink: string }> = {
  mehendi: { bg: '#E1F0DF', ink: '#2C6A37' },   // green
  haldi: { bg: '#FFF0B8', ink: '#80590A' },     // turmeric yellow
  carnival: { bg: '#FFF0B8', ink: '#80590A' },
  pooja: { bg: '#FDE7D2', ink: '#9A4509' },     // saffron
  kumkum: { bg: '#FDE0DC', ink: '#A3261B' },
  rakhi: { bg: '#FDE7D2', ink: '#9A4509' },
  mayra: { bg: '#F6E4D6', ink: '#8A4A1F' },     // terracotta
  ring: { bg: '#FBE8EF', ink: '#9A2552' },      // rose
  garland: { bg: '#FBE8EF', ink: '#9A2552' },
  music: { bg: '#EDE3F8', ink: '#5B2E8A' },     // purple
  nikasi: { bg: '#F3E1E5', ink: '#5E1426' },    // oxblood
  meet: { bg: '#DDF0EE', ink: '#1E6A66' },      // teal
  phere: { bg: '#FDE2D9', ink: '#A3290F' },     // sacred-fire red
  reception: { bg: '#F6ECD3', ink: '#7A5A22' }, // gold
  travel: { bg: '#E7EEF9', ink: '#24498A' },    // blue
  meal: { bg: '#EFE6D9', ink: '#5A4B47' },
  tea: { bg: '#EFE6D9', ink: '#5A4B47' },
};

/** Round tinted chip with the event's icon. Decorative (the title carries the meaning). */
export function EventBadge({ ev, size = 40 }: { ev: EventItem; size?: number }) {
  const name = eventIconName(ev);
  const th = THEME[name] ?? THEME.meal;
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full" style={{ width: size, height: size, background: th.bg, color: th.ink }}>
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}
