import type { User } from '../../../core/api/schemas';
import { toAppError, type AppError } from '../../../core/errors/appError';
import type { AccountChanges } from './accountForm';

export interface AccountWriter {
  changeUsername: (newUsername: string) => Promise<User>;
  changeEmail: (newEmail: string, password: string) => Promise<User>;
}

export type AccountSaveResult =
  | { ok: true; user: User }
  /**
   * `user` is the latest account state the server confirmed (so the UI stays consistent with what
   * actually happened); `done` says which parts went through before `failed` did.
   */
  | { ok: false; failed: 'username' | 'email'; error: AppError; user: User | null; done: 'none' | 'username' };

/**
 * Runs the changes in the order the product wants — username first, then email (which needs the
 * password) — and stops at the first failure.
 *
 * The partial-failure case is the interesting one: the username PUT succeeds (and its fresh tokens
 * are stored) but the email PUT fails, e.g. a wrong password. The result then says exactly that, and
 * carries the post-username user, so the screen can show "username saved, email not" rather than
 * pretending nothing happened or that everything did.
 */
export async function applyAccountChanges(
  changes: AccountChanges,
  password: string | undefined,
  api: AccountWriter,
): Promise<AccountSaveResult> {
  let user: User | null = null;
  let done: 'none' | 'username' = 'none';

  if (changes.username !== undefined) {
    try {
      user = await api.changeUsername(changes.username);
      done = 'username';
    } catch (cause) {
      return { ok: false, failed: 'username', error: toAppError(cause), user, done };
    }
  }

  if (changes.email !== undefined) {
    try {
      user = await api.changeEmail(changes.email, password ?? '');
    } catch (cause) {
      return { ok: false, failed: 'email', error: toAppError(cause), user, done };
    }
  }

  // `changes` was non-empty, so one of the calls above produced a user.
  return { ok: true, user: user as User };
}
