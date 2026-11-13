import { useFonts } from 'expo-font';

import { LOGO_FONT } from './tokens';

/**
 * Loads the app's custom fonts. The root layout keeps the splash screen up until this resolves, so
 * the wordmark never flashes in a fallback face.
 *
 * Kodchasan Bold is copied from the Flutter app (`triplex/assets/fonts`). The upstream family is
 * published on Google Fonts under the SIL Open Font License — keep its licence text with the
 * binary before a store release (tracked in MIGRATION_PLAN.md, Task 13).
 */
export function useAppFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useFonts({
    [LOGO_FONT]: require('../../assets/fonts/Kodchasan-Bold.ttf'),
  });
  return { loaded, error };
}
