import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { useToastStore } from '../../../design-system';
import { useAuthStore } from '../../auth/store/authStore';
import { AccountApi } from '../api/accountApi';
import { AVAILABILITY_DEBOUNCE_MS } from '../hooks/useUsernameAvailability';
import { AccountScreen } from './AccountScreen';
import { ConfirmPasswordSheet } from './ConfirmPasswordSheet';

jest.mock('../api/accountApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => mockParams,
  Stack: { Screen: () => null },
}));

const api = jest.mocked(AccountApi);
const user = { id: '1', username: 'jo_doe', email: 'jo@x.co' };
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const renderScreen = (ui: ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
const advance = (ms: number) => act(async () => void (await jest.advanceTimersByTimeAsync(ms)));
const bad = (message: string) => new AppError({ kind: 'bad_request', message, status: 400 });
const saveButton = () => screen.getByTestId('save-account');

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  // (not resetAllMocks: that would also wipe jest-expo's AccessibilityInfo mocks)
  Object.values(api).forEach((fn) => fn.mockReset());
  mockPush.mockReset();
  mockBack.mockReset();
  mockParams = {};
  useAuthStore.setState({ user, status: 'authenticated', isLoading: false, error: null });
  useToastStore.setState({ current: null });
});
afterEach(() => jest.useRealTimers());

describe('AccountScreen', () => {
  it('starts with the current values and Save disabled', async () => {
    await renderScreen(<AccountScreen />);
    expect(screen.getByLabelText('Username').props.value).toBe('jo_doe');
    expect(screen.getByLabelText('Email').props.value).toBe('jo@x.co');
    expect(saveButton()).toBeDisabled();
  });

  it('shows "checking" then "available", and only then enables Save', async () => {
    api.isUsernameAvailable.mockResolvedValue(true);
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'jo_new');
    expect(screen.getByText('Checking availability…')).toBeTruthy();
    expect(saveButton()).toBeDisabled();
    await advance(AVAILABILITY_DEBOUNCE_MS);
    expect(screen.getByText('Username is available')).toBeTruthy();
    expect(saveButton()).toBeEnabled();
  });

  it('blocks Save and says why when the username is taken', async () => {
    api.isUsernameAvailable.mockResolvedValue(false);
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'taken_name');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    expect(screen.getByText('That username is already taken.')).toBeTruthy();
    expect(saveButton()).toBeDisabled();
  });

  it('blocks Save for an invalid username without asking the server', async () => {
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'no spaces');
    await advance(1000);
    expect(screen.getByText('Use 3–30 letters, numbers or underscores.')).toBeTruthy();
    expect(saveButton()).toBeDisabled();
    expect(api.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it('username only: saves directly (no password sheet), updates the session, toasts', async () => {
    api.isUsernameAvailable.mockResolvedValue(true);
    api.changeUsername.mockResolvedValue({ ...user, username: 'jo_new' });
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'jo_new');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    await fireEvent.press(saveButton());
    await waitFor(() => expect(api.changeUsername).toHaveBeenCalledWith('jo_new'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user?.username).toBe('jo_new');
    expect(useToastStore.getState().current).toMatchObject({ message: 'Username updated.', kind: 'success' });
    expect(saveButton()).toBeDisabled(); // nothing left to save
  });

  it('a failed username save toasts the server message, buzzes, and leaves the session alone', async () => {
    api.isUsernameAvailable.mockResolvedValue(true);
    api.changeUsername.mockRejectedValue(bad('That username is already taken.'));
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'jo_new');
    await advance(AVAILABILITY_DEBOUNCE_MS);
    await fireEvent.press(saveButton());
    await waitFor(() => expect(useToastStore.getState().current).not.toBeNull());
    expect(useToastStore.getState().current).toMatchObject({ message: 'That username is already taken.', kind: 'error' });
    expect(jest.mocked(Haptics.notificationAsync)).toHaveBeenCalledWith('error');
    expect(useAuthStore.getState().user?.username).toBe('jo_doe');
  });

  it('email change: opens the password sheet with both drafts and saves nothing yet', async () => {
    api.isUsernameAvailable.mockResolvedValue(true);
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'New@X.co');
    await fireEvent.press(saveButton());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/settings/confirm-password', params: { username: 'jo_doe', email: 'New@X.co' } });
    expect(api.changeEmail).not.toHaveBeenCalled();
    expect(api.changeUsername).not.toHaveBeenCalled();
  });

  it('flags an invalid email and blocks Save', async () => {
    await renderScreen(<AccountScreen />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'nope');
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(saveButton()).toBeDisabled();
  });
});

describe('ConfirmPasswordSheet', () => {
  beforeEach(() => {
    mockParams = { username: 'jo_doe', email: 'New@X.co' };
  });
  const confirm = () => screen.getByTestId('confirm-password');
  const typePassword = (value: string) => fireEvent.changeText(screen.getByLabelText('Password'), value);

  it('asks for a password before doing anything', async () => {
    await renderScreen(<ConfirmPasswordSheet />);
    await fireEvent.press(confirm());
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(api.changeEmail).not.toHaveBeenCalled();
  });

  it('success: sends the lower-cased email + password, updates the session, closes, toasts', async () => {
    api.changeEmail.mockResolvedValue({ ...user, email: 'new@x.co' });
    await renderScreen(<ConfirmPasswordSheet />);
    await typePassword('secret');
    await fireEvent.press(confirm());
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(api.changeEmail).toHaveBeenCalledWith('new@x.co', 'secret');
    expect(api.changeUsername).not.toHaveBeenCalled(); // username unchanged
    expect(useAuthStore.getState().user?.email).toBe('new@x.co');
    expect(useToastStore.getState().current).toMatchObject({ message: 'Account updated.', kind: 'success' });
  });

  it('wrong password: stays open with an inline error, session unchanged, can retry', async () => {
    api.changeEmail.mockRejectedValueOnce(bad('That password is incorrect.'));
    await renderScreen(<ConfirmPasswordSheet />);
    await typePassword('wrong');
    await fireEvent.press(confirm());
    await waitFor(() => expect(screen.getByText('That password is incorrect.')).toBeTruthy());
    expect(mockBack).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user?.email).toBe('jo@x.co');

    api.changeEmail.mockResolvedValueOnce({ ...user, email: 'new@x.co' });
    await typePassword('right');
    expect(screen.queryByText('That password is incorrect.')).toBeNull(); // clears on edit
    await fireEvent.press(confirm());
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('PARTIAL FAILURE: username + email, email rejected → exact message, username kept, retry sends ONLY the email', async () => {
    mockParams = { username: 'jo_new', email: 'new@x.co' };
    api.changeUsername.mockResolvedValue({ ...user, username: 'jo_new' });
    api.changeEmail.mockRejectedValueOnce(bad('That password is incorrect.'));
    await renderScreen(<ConfirmPasswordSheet />);
    await typePassword('wrong');
    await fireEvent.press(confirm());

    await waitFor(() => expect(screen.getByText('Your username was changed, but your email was not. That password is incorrect.')).toBeTruthy());
    expect(useAuthStore.getState().user).toMatchObject({ username: 'jo_new', email: 'jo@x.co' }); // consistent with the server
    expect(mockBack).not.toHaveBeenCalled();

    api.changeEmail.mockResolvedValueOnce({ ...user, username: 'jo_new', email: 'new@x.co' });
    await typePassword('right');
    await fireEvent.press(confirm());
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(api.changeUsername).toHaveBeenCalledTimes(1); // NOT repeated
    expect(api.changeEmail).toHaveBeenLastCalledWith('new@x.co', 'right');
  });

  it('two quick taps make one request', async () => {
    let finish!: (u: typeof user) => void;
    api.changeEmail.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    await renderScreen(<ConfirmPasswordSheet />);
    await typePassword('secret');
    await fireEvent.press(confirm());
    await fireEvent.press(confirm());
    expect(api.changeEmail).toHaveBeenCalledTimes(1);
    await act(async () => finish({ ...user, email: 'new@x.co' }));
  });
});
