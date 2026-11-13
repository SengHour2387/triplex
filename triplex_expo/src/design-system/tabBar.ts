import type { ColorTokens } from './tokens';

/**
 * Colours for the native bottom tab bar.
 *
 * The tab bar is drawn by the OS, so it is not themed like our own surfaces — but its *unselected*
 * items are the weak point. Measured on iOS 18.5 (light mode): the system's default grey gives the
 * unselected labels ≈ 2.4:1 and the icons ≈ 2.9:1 against the bar, below WCAG AA (4.5:1 text,
 * 3:1 icons). So where the OS does not adapt, unselected items use `textSecondary` (≥ 4.5:1 on
 * both canvases — asserted in `tokens.test.ts`).
 *
 * On iOS 26 the bar is Liquid Glass, which re-tints its items to whatever is behind it (dark on
 * light content, light on dark content); an explicit colour would defeat that, so there we pass
 * only the selected tint.
 */
export interface TabBarColorProps {
  tintColor: string;
  iconColor?: { default: string; selected: string };
  labelStyle?: { default: { color: string }; selected: { color: string } };
}

export function resolveTabBarColors(systemDrawsGlass: boolean, colors: ColorTokens): TabBarColorProps {
  // Selected tab = the app's primary (black in light / white in dark), as Flutter's tab bar resolved to.
  if (systemDrawsGlass) return { tintColor: colors.primary };

  return {
    tintColor: colors.primary,
    iconColor: { default: colors.textSecondary, selected: colors.primary },
    labelStyle: {
      default: { color: colors.textSecondary },
      selected: { color: colors.primary },
    },
  };
}
