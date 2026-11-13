import { create } from 'zustand';

import { sessionEvents } from '../../../core/auth/sessionEvents';
import { toAppError } from '../../../core/errors/appError';
import { logger } from '../../../core/logger';
import { secureStorage } from '../../../core/storage/secureStorage';
import { AuthApi } from '../api/authApi';
import type { AuthState } from '../types/auth.types';

export const useAuthStore = create<AuthState>((set) => {
  // The API layer ends the session (refresh token rejected); mirror that into state.
  sessionEvents.onExpired(() => {
    set({
      user: null,
      status: 'unauthenticated',
      isLoading: false,
      error: 'Your session has expired. Please sign in again.',
    });
  });

  /** Run a sign-in style action; on failure store the user-safe message and rethrow the AppError. */
  async function authenticate(action: () => ReturnType<typeof AuthApi.login>) {
    set({ isLoading: true, error: null });
    try {
      const user = await action();
      set({ user, status: 'authenticated', isLoading: false, error: null });
      return user;
    } catch (cause) {
      const error = toAppError(cause);
      set({ status: 'unauthenticated', isLoading: false, error: error.message });
      throw error;
    }
  }

  return {
    user: null,
    status: 'idle',
    isLoading: false,
    error: null,

    login: (credentials) => authenticate(() => AuthApi.login(credentials)),
    register: (credentials) => authenticate(() => AuthApi.register(credentials)),

    logout: async () => {
      set({ isLoading: true });
      try {
        await AuthApi.logout();
      } catch (cause) {
        // Clearing stored credentials failed. The in-memory session still ends below; don't let the
        // rejection escape from a button handler (`void logout()`).
        logger.warn('sign-out: could not clear stored credentials', toAppError(cause).message);
      } finally {
        set({ user: null, status: 'unauthenticated', isLoading: false, error: null });
      }
    },

    checkAuth: async () => {
      set({ isLoading: true });
      const [token, cachedUser] = await Promise.all([secureStorage.getAccessToken(), AuthApi.getCachedUser()]);

      if (!token) {
        set({ user: null, status: 'unauthenticated', isLoading: false });
        return null;
      }
      // Show the cached user immediately; the network call below confirms it.
      if (cachedUser) set({ user: cachedUser, status: 'authenticated' });

      try {
        const user = await AuthApi.getMe();
        set({ user, status: 'authenticated', isLoading: false });
        return user;
      } catch {
        // The interceptor already refreshed or ended the session. If credentials survive, the failure
        // was transient (offline, 5xx): keep the cached user rather than signing out.
        if (await secureStorage.getAccessToken()) {
          set({ isLoading: false, status: cachedUser ? 'authenticated' : 'unauthenticated' });
          return cachedUser;
        }
        set({ user: null, status: 'unauthenticated', isLoading: false });
        return null;
      }
    },

    clearError: () => set({ error: null }),

    updateUser: (user) => set((state) => (state.status === 'authenticated' ? { user } : state)),
  };
});
