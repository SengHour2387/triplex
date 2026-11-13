import type { AccountChanges } from './accountForm';
import type { AccountSaveResult } from './applyAccountChanges';

export interface SaveOutcome {
  ok: boolean;
  /** User-safe text, ready for a toast or an inline message. */
  message: string;
}

/** Turns a save result into the sentence the user reads — exact about what did and didn't happen. */
export function describeSaveResult(result: AccountSaveResult, changes: AccountChanges): SaveOutcome {
  if (result.ok) {
    return { ok: true, message: changes.email === undefined ? 'Username updated.' : 'Account updated.' };
  }
  if (result.failed === 'email' && result.done === 'username') {
    return { ok: false, message: `Your username was changed, but your email was not. ${result.error.message}` };
  }
  return { ok: false, message: result.error.message };
}
