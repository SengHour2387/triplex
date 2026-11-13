import axios, { AxiosError, type AxiosAdapter, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { type AppError, isAppError } from '../errors/appError';
import type { TokenStore } from '../storage/secureStorage';
import { installAuthInterceptor } from './authInterceptor';

jest.mock('../logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

type Reply = { status: number; data?: unknown } | { networkError: 'ERR_NETWORK' | 'ECONNABORTED' };
type Handler = (config: InternalAxiosRequestConfig, callNumber: number) => Reply | Promise<Reply>;

/** An axios adapter that serves scripted replies and records every request. */
function fakeServer(routes: Record<string, Handler>) {
  const calls: { url: string; auth?: string }[] = [];
  const counts: Record<string, number> = {};

  const adapter: AxiosAdapter = async (config) => {
    const url = config.url ?? '';
    counts[url] = (counts[url] ?? 0) + 1;
    // The original bug was an endless refresh→retry loop; fail fast instead of hanging the suite.
    if (counts[url] > 10) throw new Error(`runaway retry loop on "${url}"`);
    calls.push({ url, auth: config.headers.Authorization as string | undefined });
    const reply = await (routes[url] ?? (() => ({ status: 404 })))(config, counts[url]);

    if ('networkError' in reply) {
      throw new AxiosError('Network Error', reply.networkError, config);
    }
    const response = { status: reply.status, statusText: '', headers: {}, config, data: reply.data };
    if (reply.status >= 200 && reply.status < 300) return response;
    throw new AxiosError(`HTTP ${reply.status}`, 'ERR_BAD_REQUEST', config, null, response);
  };

  const count = (url: string) => counts[url] ?? 0;
  return { adapter, calls, count };
}

function memoryTokens(initial: { access?: string; refresh?: string } = { access: 'old', refresh: 'refresh-1' }) {
  const state = { access: initial.access ?? null, refresh: initial.refresh ?? null } as {
    access: string | null;
    refresh: string | null;
  };
  const tokens: TokenStore = {
    getAccessToken: async () => state.access,
    getRefreshToken: async () => state.refresh,
    setTokens: async (access, refresh) => {
      state.access = access;
      if (refresh) state.refresh = refresh;
    },
    clear: async () => {
      state.access = null;
      state.refresh = null;
    },
  };
  return { tokens, state };
}

const REFRESH_OK: Handler = () => ({
  status: 200,
  data: { status: 'success', accessToken: 'new', refreshToken: 'refresh-2' },
});

function setup(routes: Record<string, Handler>, initial?: Parameters<typeof memoryTokens>[0]) {
  const server = fakeServer(routes);
  const { tokens, state } = memoryTokens(initial);
  const onSessionExpired = jest.fn();
  // eslint-disable-next-line import/no-named-as-default-member -- `axios.create` is axios's documented API
  const api: AxiosInstance = axios.create({ adapter: server.adapter });
  // eslint-disable-next-line import/no-named-as-default-member
  const refreshApi: AxiosInstance = axios.create({ adapter: server.adapter });
  installAuthInterceptor({ api, refreshApi, tokens, onSessionExpired });
  return { api, server, state, onSessionExpired };
}

async function failure(promise: Promise<unknown>): Promise<AppError> {
  try {
    await promise;
  } catch (error) {
    if (!isAppError(error)) throw new Error(`expected an AppError, got ${String(error)}`);
    return error;
  }
  throw new Error('expected the request to fail');
}

const ok: Handler = () => ({ status: 200, data: { ok: true } });
/** 401 until the replayed request carries the refreshed token. */
const needsNewToken: Handler = (config) =>
  config.headers.Authorization === 'Bearer new' ? { status: 200, data: { ok: true } } : { status: 401 };

describe('request: attaching the token', () => {
  it('sends the stored access token', async () => {
    const { api, server } = setup({ 'posts/feed': ok });
    await api.get('posts/feed');
    expect(server.calls[0].auth).toBe('Bearer old');
  });

  it('does not overwrite an Authorization header the caller set', async () => {
    const { api, server } = setup({ x: ok });
    await api.get('x', { headers: { Authorization: 'Bearer custom' } });
    expect(server.calls[0].auth).toBe('Bearer custom');
  });
});

describe('401 → refresh → replay', () => {
  it('refreshes once and replays the request with the new token', async () => {
    const { api, server, state } = setup({ 'posts/feed': needsNewToken, 'auth/refresh': REFRESH_OK });

    const response = await api.get('posts/feed');

    expect(response.data).toEqual({ ok: true });
    expect(server.count('auth/refresh')).toBe(1);
    expect(server.calls.at(-1)?.auth).toBe('Bearer new');
    expect(state).toEqual({ access: 'new', refresh: 'refresh-2' });
  });

  it('concurrent 401s trigger exactly ONE refresh, and every request replays with the new token', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { api, server } = setup({
      a: needsNewToken,
      b: needsNewToken,
      c: needsNewToken,
      'auth/refresh': async () => {
        await gate; // hold the refresh open so all three 401s pile up behind it
        return REFRESH_OK({} as InternalAxiosRequestConfig, 1);
      },
    });

    const results = Promise.all([api.get('a'), api.get('b'), api.get('c')]);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(server.count('auth/refresh')).toBe(1); // all three are waiting on the same refresh
    release();
    await results;

    expect(server.count('auth/refresh')).toBe(1);
    const replays = server.calls.filter((c) => ['a', 'b', 'c'].includes(c.url) && c.auth === 'Bearer new');
    expect(replays.map((c) => c.url).sort()).toEqual(['a', 'b', 'c']);
  });

  it('a late 401 (sent with a token that has since been replaced) replays without a second refresh', async () => {
    const { api, server, state } = setup({
      late: (config) => (config.headers.Authorization === 'Bearer new' ? { status: 200 } : { status: 401 }),
    });
    state.access = 'new'; // a refresh finished while this request was in flight
    // Force the request to go out with the stale token.
    await api.get('late', { headers: { Authorization: 'Bearer old' } });
    expect(server.count('auth/refresh')).toBe(0);
    expect(server.calls.at(-1)?.auth).toBe('Bearer new');
  });

  it('terminates after ONE retry when the 401 persists with a fresh token', async () => {
    const { api, server, onSessionExpired } = setup({ x: () => ({ status: 401 }), 'auth/refresh': REFRESH_OK });

    const error = await failure(api.get('x'));

    expect(error.kind).toBe('unauthorized');
    expect(server.count('x')).toBe(2); // the original + exactly one replay
    expect(server.count('auth/refresh')).toBe(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});

describe('403 is a permission error, not an expired token', () => {
  it('does not refresh (deleting someone else’s comment), and maps the backend code to a human message', async () => {
    const { api, server, onSessionExpired } = setup({
      'comments/comment/9': () => ({ status: 403, data: { status: 'error', message: 'comment/unauthorized' } }),
      'auth/refresh': REFRESH_OK,
    });

    const error = await failure(api.delete('comments/comment/9'));

    expect(server.count('auth/refresh')).toBe(0);
    expect(server.count('comments/comment/9')).toBe(1);
    expect(error).toMatchObject({ kind: 'forbidden', status: 403, code: 'comment/unauthorized' });
    expect(error.message).toBe("You can't delete someone else's comment.");
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});

describe('refresh failures', () => {
  it.each([401, 403])('refresh rejected with %i → credentials wiped, session ended, queued requests fail', async (status) => {
    const { api, server, state, onSessionExpired } = setup({
      a: () => ({ status: 401 }),
      b: () => ({ status: 401 }),
      'auth/refresh': async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { status, data: { status: 'error', message: 'auth/token_revoked' } };
      },
    });

    const [a, b] = await Promise.all([failure(api.get('a')), failure(api.get('b'))]);

    expect(a.code).toBe('auth/session_expired');
    expect(b.code).toBe('auth/session_expired');
    expect(server.count('auth/refresh')).toBe(1);
    expect(state).toEqual({ access: null, refresh: null });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it.each(['ERR_NETWORK', 'ECONNABORTED'] as const)(
    'refresh network failure (%s) → session KEPT, request fails with a network/timeout error',
    async (networkError) => {
      const { api, state, onSessionExpired } = setup({
        x: () => ({ status: 401 }),
        'auth/refresh': () => ({ networkError }),
      });

      const error = await failure(api.get('x'));

      expect(error.kind).toBe(networkError === 'ERR_NETWORK' ? 'network' : 'timeout');
      expect(state).toEqual({ access: 'old', refresh: 'refresh-1' });
      expect(onSessionExpired).not.toHaveBeenCalled();
    },
  );

  it('refresh 5xx → session kept', async () => {
    const { api, state, onSessionExpired } = setup({
      x: () => ({ status: 401 }),
      'auth/refresh': () => ({ status: 503 }),
    });
    const error = await failure(api.get('x'));
    expect(error.kind).toBe('server');
    expect(state.refresh).toBe('refresh-1');
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('a malformed refresh body → invalid_response, session kept', async () => {
    const { api, state, onSessionExpired } = setup({
      x: () => ({ status: 401 }),
      'auth/refresh': () => ({ status: 200, data: { status: 'success' } }), // no accessToken
    });
    const error = await failure(api.get('x'));
    expect(error.kind).toBe('invalid_response');
    expect(state.refresh).toBe('refresh-1');
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('no refresh token stored → session ended without calling the server', async () => {
    const { api, server, onSessionExpired } = setup({ x: () => ({ status: 401 }) }, { access: 'old' });
    const error = await failure(api.get('x'));
    expect(error.code).toBe('auth/session_expired');
    expect(server.count('auth/refresh')).toBe(0);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('a 401 from the refresh endpoint itself never starts another refresh', async () => {
    const { api, server } = setup({ 'auth/refresh': () => ({ status: 401 }) });
    const error = await failure(api.post('auth/refresh', {}));
    expect(error.kind).toBe('unauthorized');
    expect(server.count('auth/refresh')).toBe(1);
  });

  it('after a failed refresh, the next 401 can start a fresh refresh (the lock is released)', async () => {
    let refreshCalls = 0;
    const { api, server } = setup({
      x: needsNewToken,
      'auth/refresh': () => (++refreshCalls === 1 ? { networkError: 'ERR_NETWORK' } : REFRESH_OK({} as InternalAxiosRequestConfig, 1)),
    });
    await failure(api.get('x'));
    await api.get('x');
    expect(server.count('auth/refresh')).toBe(2);
  });
});

describe('every error leaving the client is an AppError', () => {
  it.each<[string, Reply, string]>([
    ['offline', { networkError: 'ERR_NETWORK' }, 'network'],
    ['timeout', { networkError: 'ECONNABORTED' }, 'timeout'],
    ['404', { status: 404 }, 'not_found'],
    ['400', { status: 400, data: { status: 'error', message: 'profile/change_username_username_taken' } }, 'bad_request'],
    ['500', { status: 500, data: { status: 'error', message: 'Failed to log in' } }, 'server'],
  ])('%s', async (_name, reply, kind) => {
    const { api } = setup({ x: () => reply });
    const error = await failure(api.get('x'));
    expect(error.kind).toBe(kind);
    expect(error.message.length).toBeGreaterThan(0);
    expect(error.message).not.toMatch(/\//); // never a raw `domain/code` or URL
  });
});
