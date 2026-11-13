import { useQuery } from '@tanstack/react-query';

import type { User } from '../../../core/api/schemas';
import { toAppError, type AppError } from '../../../core/errors/appError';
import { AuthApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../auth/store/authStore';

export const myProfileKey = ['profile', 'me'] as const;

export interface MyProfile {
  /** The signed-in user: saved at sign-in, then kept fresh by this query and by account edits. */
  user: User | null;
  /** First load with nothing to show yet. */
  isLoading: boolean;
  /** Nothing to show, and the request is waiting for the network to come back. */
  isOffline: boolean;
  /** The last fetch failed. `user` may still hold the saved copy. */
  error: AppError | null;
  isRefreshing: boolean;
  refresh: () => void;
}

/**
 * The signed-in user's profile (`GET profile/me`).
 *
 * The session already holds the user from sign-in / cold-start restore, so the screen has something
 * to show immediately (even offline); the query then freshens it and writes the result back to the
 * session so other screens see it too.
 */
export function useMyProfile(): MyProfile {
  const sessionUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const query = useQuery({
    queryKey: myProfileKey,
    queryFn: async () => {
      const user = await AuthApi.getMe();
      updateUser(user);
      return user;
    },
  });

  return {
    // The session is the single source of truth: the query writes into it, and account edits update it
    // directly — preferring `query.data` would show a stale name until the next refetch.
    user: sessionUser,
    isLoading: query.isPending && sessionUser === null && query.fetchStatus === 'fetching',
    isOffline: query.isPending && sessionUser === null && query.fetchStatus === 'paused',
    error: query.isError ? toAppError(query.error) : null,
    isRefreshing: query.isRefetching,
    refresh: () => void query.refetch(),
  };
}
