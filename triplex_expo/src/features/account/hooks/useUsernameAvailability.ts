import { useEffect, useState } from 'react';

import { AccountApi } from '../api/accountApi';
import { normalizeUsername, validateUsername, type UsernameStatus } from '../model/accountForm';

export const AVAILABILITY_DEBOUNCE_MS = 400;

type Answer = { username: string; status: 'available' | 'taken' | 'unverified' };

/**
 * Live availability of the username being typed.
 *
 * - Nothing is asked for an empty box or the user's own current name (`idle`), or an invalid one
 *   (`invalid`). Both are decided locally, synchronously, with no request.
 * - Otherwise `checking`, until the user has paused for 400 ms and one request has answered.
 * - **Stale answers are dropped, twice over.** Every keystroke cancels the pending timer and aborts
 *   the request in flight (an aborted request never reports), and an answer is stored *with the name
 *   it is about* and only used while that is still the name in the box — so a slow reply for "jo" can
 *   never decide the status of "jon".
 * - If the check itself fails (offline, 5xx) the status is `unverified`, NOT `taken`: we couldn't
 *   find out, and the server still rejects a taken name on save.
 */
export function useUsernameAvailability(value: string, currentUsername: string): UsernameStatus {
  const username = normalizeUsername(value);
  const [answer, setAnswer] = useState<Answer | null>(null);

  const local: UsernameStatus | null =
    !username || username === normalizeUsername(currentUsername) ? 'idle' : validateUsername(username) ? 'invalid' : null;

  useEffect(() => {
    if (local) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      AccountApi.isUsernameAvailable(username, controller.signal).then(
        (available) => {
          if (!controller.signal.aborted) setAnswer({ username, status: available ? 'available' : 'taken' });
        },
        () => {
          if (!controller.signal.aborted) setAnswer({ username, status: 'unverified' });
        },
      );
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, local]);

  if (local) return local;
  return answer?.username === username ? answer.status : 'checking';
}
