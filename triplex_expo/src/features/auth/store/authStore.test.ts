import { AppError } from '../../../core/errors/appError';
import { sessionEvents } from '../../../core/auth/sessionEvents';
import { secureStorage } from '../../../core/storage/secureStorage';
import { AuthApi } from '../api/authApi';
import { useAuthStore } from './authStore';

jest.mock('../api/authApi');
jest.mock('../../../core/storage/secureStorage', () => ({
  secureStorage: { getAccessToken: jest.fn() },
}));

const api = jest.mocked(AuthApi);
const storage = jest.mocked(secureStorage);
const user = { id: '1', username: 'jo', email: 'jo@x.co' };
const reset = () => useAuthStore.setState({ user: null, status: 'idle', isLoading: false, error: null });

beforeEach(() => {
  jest.resetAllMocks();
  reset();
});

describe('login', () => {
  it('stores the user on success', async () => {
    api.login.mockResolvedValue(user);
    await useAuthStore.getState().login({ email: 'jo@x.co', password: 'pw' });
    expect(useAuthStore.getState()).toMatchObject({ user, status: 'authenticated', error: null, isLoading: false });
  });

  it('stores the USER-SAFE message and rethrows an AppError on failure', async () => {
    api.login.mockRejectedValue(new AppError({ kind: 'bad_request', message: 'Incorrect email or password.', status: 400 }));
    await expect(useAuthStore.getState().login({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(AppError);
    expect(useAuthStore.getState()).toMatchObject({ status: 'unauthenticated', error: 'Incorrect email or password.' });
  });

  it('turns a non-AppError into an AppError with a generic message', async () => {
    api.register.mockRejectedValue(new TypeError('Cannot read properties of undefined'));
    await expect(useAuthStore.getState().register({ username: 'a', email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(AppError);
    expect(useAuthStore.getState().error).not.toMatch(/undefined/);
  });
});

describe('session expiry from the API layer', () => {
  it('signs the user out when the interceptor ends the session', () => {
    useAuthStore.setState({ user, status: 'authenticated' });
    sessionEvents.emitExpired();
    expect(useAuthStore.getState()).toMatchObject({ user: null, status: 'unauthenticated' });
    expect(useAuthStore.getState().error).toMatch(/expired/i);
  });
});

describe('checkAuth always finishes loading', () => {
  const settle = async (setup: () => void) => {
    setup();
    await useAuthStore.getState().checkAuth();
    const { isLoading, status } = useAuthStore.getState();
    expect(isLoading).toBe(false);
    expect(status).not.toBe('idle');
  };

  it('no token', () => settle(() => {
    storage.getAccessToken.mockResolvedValue(null);
    api.getCachedUser.mockResolvedValue(null);
  }));

  it('token, server ok', () => settle(() => {
    storage.getAccessToken.mockResolvedValue('t');
    api.getCachedUser.mockResolvedValue(user);
    api.getMe.mockResolvedValue(user);
  }));

  it('token, transient failure, no cached user', () => settle(() => {
    storage.getAccessToken.mockResolvedValue('t');
    api.getCachedUser.mockResolvedValue(null);
    api.getMe.mockRejectedValue(new AppError({ kind: 'server', message: 'x' }));
  }));

  it('token, session ended during the check', () => settle(() => {
    storage.getAccessToken.mockResolvedValueOnce('t').mockResolvedValueOnce(null);
    api.getCachedUser.mockResolvedValue(user);
    api.getMe.mockRejectedValue(new AppError({ kind: 'unauthorized', message: 'x' }));
  }));
});

describe('checkAuth', () => {
  it('no token → unauthenticated', async () => {
    storage.getAccessToken.mockResolvedValue(null);
    api.getCachedUser.mockResolvedValue(null);
    expect(await useAuthStore.getState().checkAuth()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('token + reachable server → fresh user', async () => {
    storage.getAccessToken.mockResolvedValue('t');
    api.getCachedUser.mockResolvedValue(user);
    api.getMe.mockResolvedValue({ ...user, name: 'Jo' });
    expect((await useAuthStore.getState().checkAuth())?.name).toBe('Jo');
  });

  it('offline at launch (credentials survive) → stays signed in with the cached user', async () => {
    storage.getAccessToken.mockResolvedValue('t');
    api.getCachedUser.mockResolvedValue(user);
    api.getMe.mockRejectedValue(new AppError({ kind: 'network', message: 'offline' }));
    expect(await useAuthStore.getState().checkAuth()).toEqual(user);
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', isLoading: false });
  });

  it('credentials wiped by a failed refresh → unauthenticated', async () => {
    storage.getAccessToken.mockResolvedValueOnce('t').mockResolvedValueOnce(null);
    api.getCachedUser.mockResolvedValue(user);
    api.getMe.mockRejectedValue(new AppError({ kind: 'unauthorized', message: 'x', code: 'auth/session_expired' }));
    expect(await useAuthStore.getState().checkAuth()).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});

describe('updateUser', () => {
  it('replaces the user while signed in', () => {
    useAuthStore.setState({ user, status: 'authenticated' });
    useAuthStore.getState().updateUser({ ...user, name: 'Jo Doe' });
    expect(useAuthStore.getState().user?.name).toBe('Jo Doe');
  });

  it('is ignored once signed out (a late response must not resurrect a session)', () => {
    useAuthStore.setState({ user: null, status: 'unauthenticated' });
    useAuthStore.getState().updateUser(user);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
