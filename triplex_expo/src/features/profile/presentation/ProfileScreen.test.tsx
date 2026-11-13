import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { AuthApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../auth/store/authStore';
import { ProfileScreen } from './ProfileScreen';

jest.mock('../../auth/api/authApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));

const api = jest.mocked(AuthApi);
const saved = { id: '1', username: 'jo_doe', email: 'jo@x.co' };
const fresh = { ...saved, name: 'Jo Doe' };

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
function renderMe(ui: ReactElement = <ProfileScreen />) {
  // No retries: a failing request should settle immediately in tests.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: saved, status: 'authenticated', isLoading: false, error: null });
});

// TanStack Query notifies subscribers on a timer; flush it inside act() so it can't land after a test.
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
});

describe('ProfileScreen', () => {
  it('shows the saved user straight away, then the fresh one, and shares it with the session', async () => {
    api.getMe.mockResolvedValue(fresh);
    await renderMe();
    expect(screen.getByText('jo_doe')).toBeTruthy();
    await waitFor(() => expect(useAuthStore.getState().user?.name).toBe('Jo Doe'));
    expect(screen.getByText('jo@x.co')).toBeTruthy();
  });

  it('keeps the saved user and says the refresh failed when the request fails', async () => {
    api.getMe.mockRejectedValue(new AppError({ kind: 'network', message: "Can't reach Triplex. Check your connection and try again." }));
    await renderMe();
    await waitFor(() => expect(screen.getByText(/Couldn't refresh/)).toBeTruthy());
    expect(screen.getByText('jo_doe')).toBeTruthy();
  });

  it('shows a retryable error when there is nothing to show', async () => {
    useAuthStore.setState({ user: null });
    api.getMe.mockRejectedValueOnce(new AppError({ kind: 'server', message: 'Something went wrong on our side. Please try again.' }));
    await renderMe();
    await waitFor(() => expect(screen.getByText("Can't get user info")).toBeTruthy());

    api.getMe.mockResolvedValue(fresh);
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('jo_doe')).toBeTruthy());
  });

  it('shows the username as the title (like Flutter), not the display name', async () => {
    api.getMe.mockResolvedValue(fresh);
    await renderMe();
    await waitFor(() => expect(useAuthStore.getState().user?.name).toBe('Jo Doe'));
    expect(screen.getByText('jo_doe')).toBeTruthy();
    expect(screen.queryByText('Jo Doe')).toBeNull();
  });

  it('has no Edit Profile button on the card (Settings lives in the app bar)', async () => {
    api.getMe.mockResolvedValue(fresh);
    await renderMe();
    await waitFor(() => expect(useAuthStore.getState().user?.name).toBe('Jo Doe'));
    expect(screen.queryByRole('button', { name: /edit profile/i })).toBeNull();
  });
});
