import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { applyThemePreference, isThemePreference, loadThemePreference, THEME_STORAGE_KEY } from './theme';

jest.mock('../../../core/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const setScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});

beforeEach(async () => {
  await AsyncStorage.clear();
  setScheme.mockClear();
  useThemeStore.setState({ preference: 'system', hydrated: false });
});

describe('applyThemePreference', () => {
  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'unspecified'], // RN 0.86: "follow the system" is 'unspecified', not null
  ] as const)('%s → Appearance.setColorScheme(%s)', (preference, scheme) => {
    applyThemePreference(preference);
    expect(setScheme).toHaveBeenCalledWith(scheme);
  });
});

describe('loadThemePreference', () => {
  it('defaults to system when nothing is saved', async () => expect(await loadThemePreference()).toBe('system'));
  it('returns the saved choice', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(await loadThemePreference()).toBe('dark');
  });
  it('ignores a corrupt value', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(await loadThemePreference()).toBe('system');
  });
  it('falls back to system when storage throws', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    expect(await loadThemePreference()).toBe('system');
  });
  it('validates', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('LIGHT')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe('themeStore', () => {
  it('hydrate reads the saved choice, APPLIES it, then reports ready', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    await useThemeStore.getState().hydrate();
    expect(setScheme).toHaveBeenCalledWith('dark');
    expect(useThemeStore.getState()).toMatchObject({ preference: 'dark', hydrated: true });
  });

  it('SURVIVES A RESTART: a choice made in one session is what the next one starts with', async () => {
    useThemeStore.getState().setPreference('dark');
    await Promise.resolve(); // let the save finish
    // "restart": fresh store state, same storage
    useThemeStore.setState({ preference: 'system', hydrated: false });
    setScheme.mockClear();
    await useThemeStore.getState().hydrate();
    expect(useThemeStore.getState().preference).toBe('dark');
    expect(setScheme).toHaveBeenCalledWith('dark');
  });

  it('choosing System after Dark follows the OS again', async () => {
    useThemeStore.getState().setPreference('dark');
    useThemeStore.getState().setPreference('system');
    expect(setScheme).toHaveBeenLastCalledWith('unspecified');
    await Promise.resolve();
    expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('still applies the choice for this session when saving fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    useThemeStore.getState().setPreference('light');
    expect(setScheme).toHaveBeenCalledWith('light');
    expect(useThemeStore.getState().preference).toBe('light');
  });

  it('hydrate is idempotent', async () => {
    await useThemeStore.getState().hydrate();
    setScheme.mockClear();
    await useThemeStore.getState().hydrate();
    expect(setScheme).not.toHaveBeenCalled();
  });
});
