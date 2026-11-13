import { apiClient } from '../../../core/api/client';
import { Endpoints } from '../../../core/api/endpoints';
import { send } from '../../../core/api/request';
import { authResponseSchema, profileMeResponseSchema, type User, userSchema } from '../../../core/api/schemas';
import { logger } from '../../../core/logger';
import { secureStorage } from '../../../core/storage/secureStorage';
import type { LoginEmailCredentials, LoginUsernameCredentials, RegisterCredentials } from '../types/auth.types';

async function persistSession(accessToken: string, refreshToken: string, user: User): Promise<User> {
  await secureStorage.setTokens(accessToken, refreshToken);
  await secureStorage.setUserJson(JSON.stringify(user));
  return user;
}

export const AuthApi = {
  /** Sign in with email or username. */
  async login(credentials: LoginEmailCredentials | LoginUsernameCredentials): Promise<User> {
    const url = 'email' in credentials ? Endpoints.auth.login : Endpoints.auth.loginUsername;
    const { accessToken, refreshToken, user } = await send(
      apiClient,
      { method: 'post', url, data: credentials },
      authResponseSchema,
    );
    return persistSession(accessToken, refreshToken, user);
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    const { accessToken, refreshToken, user } = await send(
      apiClient,
      { method: 'post', url: Endpoints.auth.register, data: credentials },
      authResponseSchema,
    );
    return persistSession(accessToken, refreshToken, user);
  },

  /** The signed-in user's profile; also refreshes the cached copy. */
  async getMe(): Promise<User> {
    const { user } = await send(apiClient, { method: 'get', url: Endpoints.profile.me }, profileMeResponseSchema);
    await secureStorage.setUserJson(JSON.stringify(user));
    return user;
  },

  /** Saves `user` as the cached copy shown at the next cold start (after a local change such as a new avatar). */
  async cacheUser(user: User): Promise<void> {
    await secureStorage.setUserJson(JSON.stringify(user));
  },

  /** The user saved by the last sign-in / profile fetch, if it is still valid. */
  async getCachedUser(): Promise<User | null> {
    const json = await secureStorage.getUserJson();
    if (!json) return null;
    try {
      const parsed = userSchema.safeParse(JSON.parse(json));
      return parsed.success ? parsed.data : null;
    } catch (error) {
      logger.warn('[auth] cached user is not valid JSON; ignoring it', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    await secureStorage.clear();
  },
};
