/** `1250` → `1.3k`, `1000` → `1k`, `999` → `999` (Flutter's PostCard counter). */
export function formatCount(count: number): string {
  if (count < 1000) return String(count);
  const thousands = count / 1000;
  const text = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1);
  return `${text}k`;
}

/**
 * Flutter's relative time: `42s`, `5m`, `3h`, `2d`, then a plain date. `now` is injectable so the
 * result is testable. A time in the future (device clock behind the server) reads as `0s`.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const seconds = Math.max(0, Math.floor((now - then.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${then.getDate()}/${then.getMonth() + 1}/${then.getFullYear()}`;
}

/**
 * A price for a trip stop or total. `currency` is whatever the author typed: an ISO code (`USD`,
 * as the real backend data has) is formatted by `Intl`; anything else (`$`, `៛`) is put in front as
 * a symbol. No currency → the bare number. Whole amounts drop the decimals (`7`, not `7.00`).
 */
export function formatMoney(amount: number, currency?: string | null): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  const code = currency?.trim();
  if (code && /^[A-Za-z]{3}$/.test(code)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code.toUpperCase(),
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(amount);
    } catch {
      // Not a real ISO code (e.g. "ABC") — fall through to the plain form.
    }
  }
  const number = amount.toFixed(digits);
  return code ? `${code}${number}` : number;
}
