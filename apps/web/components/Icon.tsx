// Self-contained inline-SVG icon set for the admin panel. No external icon library.
// Follows the same convention as the public nav (lib/nav.ts): a 24x24 viewBox with an
// SVG `path` `d` string, rendered as a line icon that inherits `currentColor`. Every admin
// `view` key resolves to an icon; a few generic names are also provided for reuse.

// The `d` path for each icon name. Admin `view` keys and generic aliases both live here.
const ICONS = {
  // Generic, reusable line icons.
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7A2 2 0 0 1 22 16.9Z',
  plus: 'M12 5v14M5 12h14',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  image: 'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 8-6-7-5 6-3-3-3 4',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2.2-1.3L14.3 2H9.7l-.4 2.1a7.3 7.3 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.3 7.3 0 0 0 2.2 1.3l.4 2.1h4.6l.4-2.1a7.3 7.3 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  drop: 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  map: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 0v16m6-14v16',
  chart: 'M3 3v18h18M8 15v3M13 10v8M18 6v12',
  building: 'M3 21h18M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17m3 0v-9a1 1 0 0 0-1-1h-3M8 7h2M8 11h2M8 15h2',
  log: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM8 12h8M8 16h8M8 8h4',
  box: 'M21 8-9-4-9 4m18 0-9 4m9-4v8l-9 4m0-12L3 8m9 4v8m0-8L3 8m0 0v8l9 4',
  menu: 'M3 12h18M3 6h18M3 18h18',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  sidebar: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm5 0v16',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  location: 'M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',

  // Admin `view` keys.
  overview: 'M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6ZM13 3v6h8V3h-8Z',
  requests: 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  find: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  inventory: 'M21 8-9-4-9 4m18 0-9 4m9-4v8l-9 4m0-12L3 8m9 4v8m0-8L3 8m0 0v8l9 4',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z',
  donors: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  volunteers: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z',
  thalassemia: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
  ledger: 'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4v14h2a2 2 0 0 1 2 2z',
  record: 'M12 5v14M5 12h14',
  homepage: 'M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5',
  pages: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6',
  announcements: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Zm15-4a8 8 0 0 1 0 10M15.5 9a4 4 0 0 1 0 6',
  events: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  media: 'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 8-6-7-5 6-3-3-3 4',
  network: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 0v16m6-14v16',
  partners: 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z',
  reports: 'M3 3v18h18M8 15v3M13 10v8M18 6v12',
  branches: 'M3 21h18M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17m3 0v-9a1 1 0 0 0-1-1h-3M8 7h2M8 11h2M8 15h2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2.2-1.3L14.3 2H9.7l-.4 2.1a7.3 7.3 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.3 7.3 0 0 0 2.2 1.3l.4 2.1h4.6l.4-2.1a7.3 7.3 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z',
  accounts: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  roles: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  data: 'M21 5c0 1.7-4 3-9 3S3 6.7 3 5s4-3 9-3 9 1.3 9 3Zm0 0v14c0 1.7-4 3-9 3s-9-1.3-9-3V5m18 7c0 1.7-4 3-9 3s-9-1.3-9-3',
  audit: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM8 12h8M8 16h8M8 8h4',
  profile: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: string;
  size?: number;
}

// Fallback dot so an unknown/missing name never breaks the render.
const FALLBACK = 'M12 12h.01';

/**
 * Renders a monochrome line icon that inherits `currentColor`. `name` accepts any admin
 * `view` key or generic alias in ICONS; anything unknown falls back to a small dot.
 */
export function Icon({ name, size = 18 }: IconProps) {
  const path = name in ICONS ? ICONS[name as IconName] : FALLBACK;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
