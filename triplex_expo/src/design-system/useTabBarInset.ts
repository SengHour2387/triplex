import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext } from 'react';

/**
 * How much of the bottom of a screen the floating tab bar covers (0 outside a tab navigator). Android:
 * the drawn bar floats over the content, so scrolling screens pad for it. iOS: UIKit does that itself
 * (`useTabBarInset.ios.ts`).
 */
export function useTabBarInset(): number {
  return useContext(BottomTabBarHeightContext) ?? 0;
}
