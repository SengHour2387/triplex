import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppError } from '../../../core/errors/appError';
import { AuthApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

jest.mock('../api/authApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
}));

const api = jest.mocked(AuthApi);
const haptic = jest.mocked(Haptics.notificationAsync);
const user = { id: '1', username: 'jo_doe', email: 'jo@x.co' };

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const renderScreen = (ui: ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, status: 'unauthenticated', isLoading: false, error: null });
});

describe('LoginScreen', () => {
  it('shows inline errors, makes no request, and buzzes when fields are empty', async () => {
    await renderScreen(<LoginScreen />);
    await fireEvent.press(screen.getByTestId('login-submit'));
    expect(screen.getByText('Enter your username or email.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(api.login).not.toHaveBeenCalled();
    expect(haptic).toHaveBeenCalledWith('error');
  });

  it('logs in with the email endpoint shape when the identifier is an email', async () => {
    api.login.mockResolvedValue(user);
    await renderScreen(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username or Email'), ' jo@x.co ');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret');
    await fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: 'jo@x.co', password: 'secret' }));
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('logs in with the username shape otherwise, and the return key on the password field submits', async () => {
    api.login.mockResolvedValue(user);
    await renderScreen(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username or Email'), 'jo_doe');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret');
    await fireEvent(screen.getByLabelText('Password'), 'submitEditing');
    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ username: 'jo_doe', password: 'secret' }));
  });

  it('shows the server’s user-safe message and buzzes on a rejected login; editing clears it', async () => {
    api.login.mockRejectedValue(new AppError({ kind: 'bad_request', message: 'Incorrect email or password.', status: 400 }));
    await renderScreen(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username or Email'), 'jo_doe');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong');
    await fireEvent.press(screen.getByTestId('login-submit'));
    expect(await screen.findByText('Incorrect email or password.')).toBeTruthy();
    expect(haptic).toHaveBeenCalledWith('error');

    await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong2');
    expect(screen.queryByText('Incorrect email or password.')).toBeNull();
  });

  it('ignores a second press while a login is in flight', async () => {
    let finish: (u: typeof user) => void = () => {};
    api.login.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    await renderScreen(<LoginScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username or Email'), 'jo_doe');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret');
    // Both submits fire in the same tick (before React re-renders with isLoading = true).
    const submit = screen.getByLabelText('Password').props.onSubmitEditing as () => void;
    await act(async () => {
      submit();
      submit();
      finish(user);
    });
    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'));
    expect(api.login).toHaveBeenCalledTimes(1);
  });

  it('submits the latest typed values even if Return fires before React re-renders', async () => {
    api.login.mockResolvedValue(user);
    await renderScreen(<LoginScreen />);
    const id = screen.getByLabelText('Username or Email').props.onChangeText as (t: string) => void;
    const pw = screen.getByLabelText('Password').props;
    await act(async () => {
      id('jo_doe');
      pw.onChangeText('secret');
      pw.onSubmitEditing(); // same tick: the handler captured at render still sees empty state
    });
    expect(api.login).toHaveBeenCalledWith({ username: 'jo_doe', password: 'secret' });
  });

  it('shows the session-expired message left by a forced sign-out', async () => {
    useAuthStore.setState({ error: 'Your session has expired. Please sign in again.' });
    await renderScreen(<LoginScreen />);
    expect(screen.getByText(/session has expired/i)).toBeTruthy();
  });

  it('wires password-manager hints', async () => {
    await renderScreen(<LoginScreen />);
    expect(screen.getByLabelText('Username or Email').props).toMatchObject({ textContentType: 'username', autoComplete: 'username' });
    expect(screen.getByLabelText('Password').props).toMatchObject({ textContentType: 'password', autoComplete: 'current-password' });
  });
});

describe('RegisterScreen', () => {
  it('validates all three fields inline', async () => {
    await renderScreen(<RegisterScreen />);
    await fireEvent.press(screen.getByTestId('register-submit'));
    expect(screen.getByText('Use 3–30 letters, numbers or underscores.')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(screen.getByText('Use at least 8 characters.')).toBeTruthy();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('registers with trimmed values', async () => {
    api.register.mockResolvedValue(user);
    await renderScreen(<RegisterScreen />);
    await fireEvent.changeText(screen.getByLabelText('Username'), ' jo_doe ');
    await fireEvent.changeText(screen.getByLabelText('Email'), ' jo@x.co ');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
    await fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() =>
      expect(api.register).toHaveBeenCalledWith({ username: 'jo_doe', email: 'jo@x.co', password: 'longenough' }),
    );
  });

  it('wires new-password hints so iOS offers a strong password', async () => {
    await renderScreen(<RegisterScreen />);
    expect(screen.getByLabelText('Password').props).toMatchObject({ textContentType: 'newPassword', autoComplete: 'new-password' });
  });
});
