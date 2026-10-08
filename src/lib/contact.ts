export type ContactQuery = { phoneNumber: number } | { username: string };

export function parseContact(input: string): ContactQuery | null {
  const value = input.trim();

  if (value.startsWith('@')) {
    return /^@[A-Za-z0-9_]{4,32}$/.test(value) ? { username: value } : null;
  }

  if (!/^[\d\s()+-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length < 10 || digits.length > 15) return null;

  return { phoneNumber: Number(digits) };
}

export function formatPhone(phoneNumber: number): string {
  const digits = String(phoneNumber);
  const ru = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits);
  return ru ? `+7 ${ru[1]} ${ru[2]}-${ru[3]}-${ru[4]}` : `+${digits}`;
}
