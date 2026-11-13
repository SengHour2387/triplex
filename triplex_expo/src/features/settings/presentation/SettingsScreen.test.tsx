import { fireEvent, render, screen } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '../../auth/store/authStore';
import { useThemeStore } from '../store/themeStore';
import { SettingsScreen } from './SettingsScreen';

jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('../../auth/api/authApi');
jest.mock('../../../core/storage/secureStorage', () => ({ secureStorage: { getAccessToken: jest.fn() } }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const setScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
const user = { id: '1', username: 'jo_doe', email: 'jo@x.co', name: 'Jo Doe' };
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const renderSettings = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SettingsScreen />
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user, status: 'authenticated', isLoading: false, error: null });
  useThemeStore.setState({ preference: 'system', hydrated: true });
});

describe('SettingsScreen', () => {
  it('summarises the account and opens the Account Center', async () => {
    await renderSettings();
    expect(screen.getByText('Jo Doe')).toBeTruthy();
    expect(screen.getByText('@jo_doe')).toBeTruthy();
    expect(screen.getByText('jo@x.co')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('open-account'));
    expect(mockPush).toHaveBeenCalledWith('/settings/account');
  });

  it('choosing a theme applies it to the whole app and remembers it', async () => {
    await renderSettings();
    await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }));
    expect(setScheme).toHaveBeenCalledWith('dark');
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('System hands control back to the OS', async () => {
    useThemeStore.setState({ preference: 'dark' });
    await renderSettings();
    await fireEvent.press(screen.getByRole('radio', { name: 'System' }));
    expect(setScheme).toHaveBeenCalledWith('unspecified');
  });

  it('signs out', async () => {
    await renderSettings();
    await fireEvent.press(screen.getByTestId('sign-out'));
    await screen.findByTestId('sign-out');
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
