import { useCallback, useRef } from 'react';

import { useAuthStore } from '../../auth/store/authStore';
import { AccountApi } from '../api/accountApi';
import { diffAccount, hasChanges, type AccountValues } from '../model/accountForm';
import { applyAccountChanges } from '../model/applyAccountChanges';
import { describeSaveResult, type SaveOutcome } from '../model/describeSaveResult';

/**
 * Saves username / email edits and keeps the session in step.
 *
 * Changes are computed against the user as it is *when you call save*, not when the screen opened:
 * after a partial failure (username saved, email rejected) a retry therefore sends only the email.
 * Whatever the server confirmed — even on a partial failure — is written back to the session, so
 * every screen reflects what really happened.
 */
export function useSaveAccount() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const inFlight = useRef(false);

  const save = useCallback(
    async (draft: AccountValues, password?: string): Promise<SaveOutcome | null> => {
      // Closes the gap between two taps landing before a re-render could disable the button.
      if (inFlight.current) return null;
      const current = useAuthStore.getState().user;
      if (!current) return null;

      const changes = diffAccount(current, draft);
      if (!hasChanges(changes)) return { ok: true, message: 'No changes to save.' };

      inFlight.current = true;
      try {
        const result = await applyAccountChanges(changes, password, AccountApi);
        if (result.user) updateUser(result.user);
        return describeSaveResult(result, changes);
      } finally {
        inFlight.current = false;
      }
    },
    [updateUser],
  );

  return save;
}
