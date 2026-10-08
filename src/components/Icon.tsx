const PATHS = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16 16l5 5',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  back: 'M19 12H5M11 18l-6-6 6-6',
  send: 'M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
  close: 'M6 6l12 12M18 6 6 18',
  alert: 'M12 8v5M12 16.5v.5M12 3l10 18H2z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const filled = name === 'send';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function StatusChecks({ double }: { double: boolean }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={double ? 'M1 5.8 4.4 9 11 2' : 'M3 5.8 6.4 9 13 2'} />
      {double && <path d="M7.6 8.6 8 9l6.6-7" />}
    </svg>
  );
}
