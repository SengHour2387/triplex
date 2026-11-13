import { apiClient } from '../../../core/api/client';
import { Endpoints } from '../../../core/api/endpoints';
import { send } from '../../../core/api/request';
import { accountChangeResponseSchema, checkUsernameResponseSchema, type User } from '../../../core/api/schemas';
import { secureStorage } from '../../../core/storage/secureStorage';

/**
 * The server revokes the old refresh token whenever the username or email changes, and answers with
 * a fresh pair. Store it BEFORE returning: if it were lost, the next token refresh would fail and
 * the user would be signed out for having changed their username.
 */
async function persist({ user, accessToken, refreshToken }: { user: User; accessToken: string; refreshToken: string }): Promise<User> {
  await secureStorage.setTokens(accessToken, refreshToken);
  await secureStorage.setUserJson(JSON.stringify(user));
  return user;
}

export const AccountApi = {
  /** Public endpoint. Rejects on a transport/server failure — the caller decides what that means. */
  async isUsernameAvailable(username: string, signal?: AbortSignal): Promise<boolean> {
    const { available } = await send(
      apiClient,
      { method: 'post', url: Endpoints.profile.checkUsername, data: { username: username.trim() }, signal },
      checkUsernameResponseSchema,
    );
    return available;
  },

  async changeUsername(newUsername: string): Promise<User> {
    const response = await send(
      apiClient,
      { method: 'put', url: Endpoints.profile.changeUsername, data: { newUsername } },
      accountChangeResponseSchema,
    );
    return persist(response);
  },

  async changeEmail(newEmail: string, password: string): Promise<User> {
    const response = await send(
      apiClient,
      { method: 'put', url: Endpoints.profile.changeEmail, data: { newEmail, password } },
      accountChangeResponseSchema,
    );
    return persist(response);
  },
};
