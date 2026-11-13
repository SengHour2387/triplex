import * as SecureStore from 'expo-secure-store';

import { secureStorage } from './secureStorage';

jest.mock('../logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
beforeEach(() => jest.clearAllMocks());

describe('secureStorage', () => {
  it('reads never throw — an unreadable entry means "signed out"', async () => {
    store.getItemAsync.mockRejectedValueOnce(new Error('keychain locked'));
    await expect(secureStorage.getAccessToken()).resolves.toBeNull();
  });

  it('writes DO throw — a token we failed to save must not look saved', async () => {
    store.setItemAsync.mockRejectedValueOnce(new Error('disk full'));
    await expect(secureStorage.setTokens('a', 'r')).rejects.toThrow('disk full');
  });

  it('setTokens without a refresh token keeps the stored refresh token', async () => {
    await secureStorage.setTokens('only-access');
    expect(store.setItemAsync).toHaveBeenCalledTimes(1);
    expect(store.setItemAsync).toHaveBeenCalledWith('triplex_access_token', 'only-access');
  });

  it('clear removes tokens and user, and one failure does not stop the others', async () => {
    store.deleteItemAsync.mockRejectedValueOnce(new Error('nope'));
    await expect(secureStorage.clear()).resolves.toBeUndefined();
    expect(store.deleteItemAsync).toHaveBeenCalledTimes(3);
  });
});
