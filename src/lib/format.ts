const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
const dayMonthFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const fullDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp);
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function formatDayLabel(timestamp: number, now = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / 86_400_000);
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  const sameYear = new Date(timestamp).getFullYear() === new Date(now).getFullYear();
  return (sameYear ? dayMonthFormat : fullDateFormat).format(timestamp);
}

export function formatListTime(timestamp: number, now = Date.now()): string {
  return isSameDay(timestamp, now) ? formatTime(timestamp) : shortDateFormat.format(timestamp);
}

const AVATAR_COLORS = ['#e17076', '#faa774', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae'];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(title: string): string {
  const words = title.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
