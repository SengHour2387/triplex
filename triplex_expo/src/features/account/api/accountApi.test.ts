import type { InternalAxiosRequestConfig } from 'axios';

import { AccountApi } from './accountApi';

/**
 * The invariant that matters: the server REVOKES the old refresh token whenever the username or email
 * changes, and returns a new pair. If that pair isn't stored, the next token refresh is rejected and
 * the user is signed out for having renamed themselves.
 *
 * This runs the REAL axios interceptor against a scripted server that models that behaviour.
 */
jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

jest.mock('../../../core/storage/secureStorage', () => {
  const state: { access: string | null; refresh: string | null; user: string | null } = { access: 'A1', refresh: 'R1', user: null };
  return {
    __state: state,
    secureStorage: {
      getAccessToken: async () => state.access,
      getRefreshToken: async () => state.refresh,
      setTokens: async (access: string, refresh?: string) => {
        state.access = access;
        if (refresh) state.refresh = refresh;
      },
      setUserJson: async (json: string) => void (state.user = json),
      clear: async () => void ((state.access = null), (state.refresh = null)),
    },
  };
});

jest.mock('../../../core/api/client', () => {
  const axios = jest.requireActual('axios');
  const { installAuthInterceptor } = jest.requireActual('../../../core/api/authInterceptor');
  const { secureStorage } = jest.requireMock('../../../core/storage/secureStorage');

  const server = {
    validAccess: new Set<string>(['A1']),
    validRefresh: new Set<string>(['R1']),
    log: [] as string[],
    expired: jest.fn(),
  };
  const user = { id: '1', username: 'jo', email: 'jo@x.co' };

  const adapter = async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';
    const bearer = /^Bearer (.+)$/.exec(String(config.headers.Authorization ?? ''))?.[1];
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {});
    server.log.push(`${config.method?.toUpperCase()} ${url} ${bearer ?? body.refreshToken ?? ''}`.trim());

    const reply = (status: number, data: unknown) => {
      const response = { status, statusText: '', headers: {}, config, data };
      if (status < 300) return response;
      throw new axios.AxiosError(`HTTP ${status}`, 'ERR_BAD_REQUEST', config, null, response);
    };

    if (url === 'auth/refresh') {
      if (!server.validRefresh.has(body.refreshToken)) return reply(401, { message: 'auth/invalid_refresh_token' });
      server.validRefresh.delete(body.refreshToken);
      server.validRefresh.add('R-refreshed');
      server.validAccess.add('A-refreshed');
      return reply(200, { accessToken: 'A-refreshed', refreshToken: 'R-refreshed' });
    }
    if (!bearer || !server.validAccess.has(bearer)) return reply(401, { message: 'auth/invalid_token' });

    if (url === 'profile/change-username' || url === 'profile/change-email') {
      // token_version bump: everything issued before is dead.
      server.validAccess.clear();
      server.validRefresh.clear();
      server.validAccess.add('A2');
      server.validRefresh.add('R2');
      return reply(200, { user: { ...user, ...(url.endsWith('username') ? { username: body.newUsername } : { email: body.newEmail }) }, accessToken: 'A2', refreshToken: 'R2' });
    }
    if (url === 'profile/me') return reply(200, { user });
    return reply(404, {});
  };

  const apiClient = axios.create({ baseURL: 'http://test', adapter });
  const refreshApi = axios.create({ baseURL: 'http://test', adapter });
  installAuthInterceptor({ api: apiClient, refreshApi, tokens: secureStorage, onSessionExpired: server.expired });
  return { apiClient, __server: server };
});

const { __server: server } = jest.requireMock('../../../core/api/client') as { __server: { validAccess: Set<string>; log: string[]; expired: jest.Mock } };
const { __state: stored } = jest.requireMock('../../../core/storage/secureStorage') as { __state: { access: string; refresh: string; user: string | null } };
const { apiClient } = jest.requireMock('../../../core/api/client') as { apiClient: { get: (url: string) => Promise<unknown> } };

describe('after a username / email change', () => {
  it('stores the new token pair and the new user', async () => {
    const user = await AccountApi.changeUsername('jo2');
    expect(user.username).toBe('jo2');
    expect(stored).toMatchObject({ access: 'A2', refresh: 'R2' });
    expect(JSON.parse(stored.user as string).username).toBe('jo2');
  });

  it('the NEXT call uses the new access token and succeeds first time', async () => {
    server.log.length = 0;
    await apiClient.get('profile/me');
    expect(server.log).toEqual(['GET profile/me A2']);
  });

  it('and when that access token later expires, the refresh uses the NEW refresh token → no sign-out', async () => {
    server.validAccess.delete('A2'); // the access token expires
    server.log.length = 0;
    await apiClient.get('profile/me');
    expect(server.log).toEqual(['GET profile/me A2', 'POST auth/refresh R2', 'GET profile/me A-refreshed']);
    expect(server.expired).not.toHaveBeenCalled();
    expect(stored.access).toBe('A-refreshed');
  });

  it('changing the email also rotates and stores the pair (and keeps working)', async () => {
    // fresh session state for this scenario
    stored.access = 'A-refreshed';
    stored.refresh = 'R-refreshed';
    const user = await AccountApi.changeEmail('new@x.co', 'pw');
    expect(user.email).toBe('new@x.co');
    expect(stored).toMatchObject({ access: 'A2', refresh: 'R2' });
    server.log.length = 0;
    await apiClient.get('profile/me');
    expect(server.log).toEqual(['GET profile/me A2']);
    expect(server.expired).not.toHaveBeenCalled();
  });
});
