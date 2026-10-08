import { describe, expect, it } from 'vitest';
import { formatPhone, parseContact } from './contact';

describe('parseContact', () => {
  it.each([
    ['+7 (900) 123-45-67', 79001234567],
    ['89001234567', 79001234567],
    ['79001234567', 79001234567],
    ['+44 20 7946 0958', 442079460958],
  ])('номер %s → %d', (input, phoneNumber) => {
    expect(parseContact(input)).toEqual({ phoneNumber });
  });

  it('распознаёт username', () => {
    expect(parseContact(' @durov ')).toEqual({ username: '@durov' });
  });

  it.each(['', '123', 'abc', '@a', '+7 900 abc'])('отклоняет «%s»', (input) => {
    expect(parseContact(input)).toBeNull();
  });
});

describe('formatPhone', () => {
  it('форматирует российский номер', () => {
    expect(formatPhone(79001234567)).toBe('+7 900 123-45-67');
  });

  it('остальные номера выводит с плюсом', () => {
    expect(formatPhone(442079460958)).toBe('+442079460958');
  });
});
