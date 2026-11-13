import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

import { logger } from '../../../core/logger';

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_OPTIONS: readonly { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const THEME_STORAGE_KEY = 'triplex_theme_preference';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Switches the whole app — our components via `useColorScheme()` *and* native controls, including
 * real Liquid Glass and the tab bar — in one call. In RN 0.86 "follow the system" is `'unspecified'`
 * (passing `null` is no longer accepted). See ADR-004.
 */
export function applyThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

/** The saved choice, or `system` when nothing valid is saved or storage can't be read. */
export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(saved) ? saved : 'system';
  } catch (error) {
    logger.warn('[theme] could not read the saved theme; using System', error);
    return 'system';
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch (error) {
    // The choice still applies for this session; it just won't survive a restart.
    logger.warn('[theme] could not save the theme choice', error);
  }
}
