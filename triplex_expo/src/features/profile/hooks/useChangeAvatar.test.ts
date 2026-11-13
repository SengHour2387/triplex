import { act, renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Linking } from 'react-native';

import { AppError } from '../../../core/errors/appError';
import { useToastStore } from '../../../design-system';
import { AuthApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../auth/store/authStore';
import { ProfileApi } from '../api/profileApi';
import { pickAvatar } from '../model/pickAvatar';
import { prepareAvatar } from '../model/prepareAvatar';
import { useAvatarUploadStore } from '../store/avatarUploadStore';
import { useChangeAvatar } from './useChangeAvatar';

jest.mock('../../auth/api/authApi');
jest.mock('../api/profileApi');
jest.mock('../model/pickAvatar');
jest.mock('../model/prepareAvatar');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));

const user = { id: '1', username: 'jo', email: 'jo@x.co', avatar_url: null };
const toastNow = () => useToastStore.getState().current;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(pickAvatar).mockReset();
  jest.mocked(prepareAvatar).mockReset();
  jest.mocked(ProfileApi.uploadAvatar).mockReset();
  useAuthStore.setState({ user, status: 'authenticated', isLoading: false, error: null });
  useToastStore.setState({ current: null });
  useAvatarUploadStore.setState({ progress: null });
  jest.mocked(pickAvatar).mockResolvedValue({ kind: 'picked', uri: 'file:///p.jpg', width: 3000, height: 2000 });
  jest.mocked(prepareAvatar).mockResolvedValue({ uri: 'file:///s.jpg', name: 'a.jpg', type: 'image/jpeg' });
  jest.mocked(ProfileApi.uploadAvatar).mockResolvedValue('https://cdn/new.jpg');
});

const run = async (source: 'camera' | 'library') => {
  const { result } = await renderHook(() => useChangeAvatar());
  await act(async () => void (await result.current.change(source)));
  return result;
};

describe('useChangeAvatar', () => {
  it('success: updates the session AND the cached user, and says so', async () => {
    await run('library');
    expect(useAuthStore.getState().user?.avatar_url).toBe('https://cdn/new.jpg');
    expect(AuthApi.cacheUser).toHaveBeenCalledWith({ ...user, avatar_url: 'https://cdn/new.jpg' });
    expect(toastNow()).toMatchObject({ message: 'Profile picture updated.', kind: 'success' });
    expect(useAvatarUploadStore.getState().progress).toBeNull();
  });

  it('camera permission refused: a warning with a way into Settings, nothing uploaded', async () => {
    jest.mocked(pickAvatar).mockResolvedValue({ kind: 'denied' });
    await run('camera');
    expect(ProfileApi.uploadAvatar).not.toHaveBeenCalled();
    expect(toastNow()).toMatchObject({ kind: 'warning', actionLabel: 'Settings' });
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    toastNow()?.onAction?.();
    expect(open).toHaveBeenCalled();
  });

  it('no camera (simulator): points to Photos instead of failing', async () => {
    jest.mocked(pickAvatar).mockResolvedValue({ kind: 'unavailable' });
    await run('camera');
    expect(toastNow()).toMatchObject({ kind: 'info', message: expect.stringContaining('Photos') });
  });

  it('cancelling the picker is silent', async () => {
    jest.mocked(pickAvatar).mockResolvedValue({ kind: 'cancelled' });
    await run('library');
    expect(toastNow()).toBeNull();
    expect(useAuthStore.getState().user?.avatar_url).toBeNull();
  });

  it('upload failure: the server message, an error haptic, the old picture kept', async () => {
    jest.mocked(ProfileApi.uploadAvatar).mockRejectedValue(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.', status: 500 }));
    await run('library');
    expect(toastNow()).toMatchObject({ kind: 'error', message: 'Something went wrong on our side. Please try again.' });
    expect(jest.mocked(Haptics.notificationAsync)).toHaveBeenCalledWith('error');
    expect(useAuthStore.getState().user?.avatar_url).toBeNull();
    expect(AuthApi.cacheUser).not.toHaveBeenCalled();
  });

  it('signed out mid-upload: the late result must not resurrect the user or rewrite the cache', async () => {
    let finish!: (url: string) => void;
    jest.mocked(ProfileApi.uploadAvatar).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { result } = await renderHook(() => useChangeAvatar());
    let pending!: Promise<void>;
    await act(async () => void (pending = result.current.change('library')));
    useAuthStore.setState({ user: null, status: 'unauthenticated' });
    await act(async () => {
      finish('https://cdn/new.jpg');
      await pending;
    });
    expect(useAuthStore.getState().user).toBeNull();
    expect(AuthApi.cacheUser).not.toHaveBeenCalled();
    expect(toastNow()).toBeNull();
  });

  it('a second request while one is running is ignored', async () => {
    let finish!: (url: string) => void;
    jest.mocked(ProfileApi.uploadAvatar).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { result } = await renderHook(() => useChangeAvatar());
    let first!: Promise<void>;
    await act(async () => void (first = result.current.change('library')));
    await act(async () => void (await result.current.change('camera')));
    expect(pickAvatar).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish('https://cdn/new.jpg');
      await first;
    });
  });
});
