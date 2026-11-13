import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

import { renderAppHeader } from './adaptive/AppHeader';
import { useTheme } from './useTheme';

type StackScreenOptions = NonNullable<Exclude<ComponentProps<typeof Stack>['screenOptions'], Function>>;

/**
 * Options for every native stack in the app: a large-title header that sits transparent over the
 * content (on iOS 26 the system draws the glass scroll-edge effect), a chevron-only back button,
 * and the themed canvas behind it.
 *
 * Android has no native large-title header, and its stock one is a Material app bar — so there the
 * navigator is given the drawn iOS-style `AppHeader` (in the layout flow, opaque) instead.
 *
 * The title colour is set explicitly: left to the system it kept the colour from the scheme the
 * app launched in, so after switching to dark mode the large title was dark grey on black.
 */
export function useStackScreenOptions(): StackScreenOptions {
  const { colors } = useTheme();
  return {
    headerLargeTitle: true,
    headerTransparent: true,
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    headerTitleStyle: { color: colors.text },
    headerLargeTitleStyle: { color: colors.text },
    contentStyle: { backgroundColor: colors.background },
    ...(Platform.OS === 'android' ? { headerTransparent: false, header: renderAppHeader } : null),
  };
}
