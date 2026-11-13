import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { colors, radii, spacing, type ColorScheme, type ColorTokens } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
}

/**
 * The single place components read design tokens from.
 *
 * It follows `useColorScheme()`. The user's Light / Dark / System choice (Task 5) is applied with
 * `Appearance.setColorScheme()`, which updates this hook *and* native controls (including real
 * Liquid Glass) together — so components never need to know about the preference.
 */
export function useTheme(): Theme {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => ({ scheme, colors: colors[scheme], spacing, radii }), [scheme]);
}
