import { EMAIL_PATTERN, USERNAME_PATTERN } from '../../auth/validation/rules';

/**
 * Emoji, ZWJ and variation selectors. Written as explicit ranges (not `\p{Extended_Pictographic}`)
 * so it does not depend on the JS engine's Unicode-property support.
 */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}‍️]/u;

export const containsEmoji = (value: string): boolean => EMOJI.test(value);

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'unverified';

/** What the server will be sent: names trimmed, email lower-cased. */
export const normalizeUsername = (value: string): string => value.trim();
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

/** Local rule only. Availability is a separate, asynchronous question. */
export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);
  if (!username) return 'Username cannot be empty.';
  if (containsEmoji(username)) return 'Emoji is not allowed.';
  if (!USERNAME_PATTERN.test(username)) return 'Use 3–30 letters, numbers or underscores.';
  return null;
}

export function validateEmail(value: string): string | null {
  const email = normalizeEmail(value);
  if (!email) return 'Email cannot be empty.';
  if (containsEmoji(email)) return 'Emoji is not allowed.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return null;
}

export interface AccountValues {
  username: string;
  email: string;
}

export interface AccountChanges {
  /** Present only when it differs from the current value. */
  username?: string;
  email?: string;
}

export function diffAccount(current: AccountValues, draft: AccountValues): AccountChanges {
  const changes: AccountChanges = {};
  if (normalizeUsername(draft.username) !== normalizeUsername(current.username)) {
    changes.username = normalizeUsername(draft.username);
  }
  if (normalizeEmail(draft.email) !== normalizeEmail(current.email)) {
    changes.email = normalizeEmail(draft.email);
  }
  return changes;
}

export const hasChanges = (changes: AccountChanges): boolean => changes.username !== undefined || changes.email !== undefined;

/**
 * Save is available only when something changed, both fields are valid, and the username is not
 * known to be unusable. `unverified` (the availability check itself failed, e.g. offline) is allowed:
 * the server is the authority and rejects a taken name on save.
 */
export function canSave(draft: AccountValues, current: AccountValues, status: UsernameStatus, busy: boolean): boolean {
  if (busy) return false;
  if (!hasChanges(diffAccount(current, draft))) return false;
  if (validateUsername(draft.username) || validateEmail(draft.email)) return false;
  return status !== 'checking' && status !== 'taken' && status !== 'invalid';
}
