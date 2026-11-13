import { formatCount, formatMoney, formatRelativeTime } from './format';

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [1250, '1.3k'],
    [2450, '2.5k'],
    [12000, '12k'],
  ])('%i → %s', (n, text) => expect(formatCount(n)).toBe(text));
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-08-10T12:00:00.000Z');
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it('counts seconds, minutes, hours and days', () => {
    expect(formatRelativeTime(ago(42_000), now)).toBe('42s');
    expect(formatRelativeTime(ago(5 * 60_000), now)).toBe('5m');
    expect(formatRelativeTime(ago(3 * 3_600_000), now)).toBe('3h');
    expect(formatRelativeTime(ago(2 * 86_400_000), now)).toBe('2d');
  });

  it('switches to a date after a week', () => {
    expect(formatRelativeTime('2026-07-01T09:00:00.000Z', now)).toMatch(/^\d{1,2}\/7\/2026$/);
  });

  it('never shows a negative time (device clock behind the server)', () => {
    expect(formatRelativeTime(new Date(now + 90_000).toISOString(), now)).toBe('0s');
  });

  it('returns nothing for text that is not a date', () => {
    expect(formatRelativeTime('not a date', now)).toBe('');
  });
});

describe('formatMoney', () => {
  it('formats an ISO currency code with Intl', () => {
    expect(formatMoney(1.5, 'USD')).toBe('$1.50');
    expect(formatMoney(7, 'usd')).toBe('$7');
  });

  it('puts a typed symbol in front', () => {
    expect(formatMoney(2.5, '$')).toBe('$2.50');
    expect(formatMoney(4000, '៛')).toBe('៛4000');
  });

  it('falls back to the plain number without a currency', () => {
    expect(formatMoney(7)).toBe('7');
    expect(formatMoney(7.25, null)).toBe('7.25');
  });

  it('survives a three-letter code that is not a currency', () => {
    expect(() => formatMoney(3, 'ZZZ')).not.toThrow();
  });
});
