import { resolveTabBarColors, type TabBarColorProps } from './tabBar';
import { isSystemGlassAvailable } from './useSurfaceMode';
import { useTheme } from './useTheme';

/** Spread onto `<NativeTabs>` — see `tabBar.ts` for why it differs by OS. */
export function useTabBarColors(): TabBarColorProps {
  const { colors } = useTheme();
  return resolveTabBarColors(isSystemGlassAvailable(), colors);
}
