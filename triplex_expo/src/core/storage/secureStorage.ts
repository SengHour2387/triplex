import * as SecureStore from 'expo-secure-store';

import { logger } from '../logger';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Keychain (iOS) / Keystore (Android) backed storage. Native only — web is not a target.
 *
 * Reads never throw: a corrupt or unreadable entry means "signed out", and that is logged.
 * Writes DO throw: silently losing a freshly issued token would leave the user "signed in" until
 * the next launch, which is worse than a visible failure.
 */
async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    logger.warn(`[secureStorage] could not read "${key}"`, error);
    return null;
  }
}

async function remove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    logger.warn(`[secureStorage] could not delete "${key}"`, error);
  }
}

export interface TokenStore {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  /** Persist a new pair. A missing `refreshToken` keeps the existing one. */
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const secureStorage = {
  getAccessToken: () => read(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => read(STORAGE_KEYS.REFRESH_TOKEN),

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  /** The raw JSON the user was stored as; parsing/validation lives with the user schema. */
  getUserJson: () => read(STORAGE_KEYS.USER),
  setUserJson: (json: string) => SecureStore.setItemAsync(STORAGE_KEYS.USER, json),

  async clear(): Promise<void> {
    await Promise.all([
      remove(STORAGE_KEYS.ACCESS_TOKEN),
      remove(STORAGE_KEYS.REFRESH_TOKEN),
      remove(STORAGE_KEYS.USER),
    ]);
  },
};
