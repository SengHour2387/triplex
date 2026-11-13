import { Stack } from 'expo-router';

import { useSheetOptions, useStackScreenOptions } from '../../src/design-system';

// A deep link straight to `settings/account` still gets Settings underneath it, so Back has somewhere to go.
export const unstable_settings = { initialRouteName: 'index' };

/**
 * Settings has its own stack, presented over the tab bar (Flutter has a dedicated settings shell).
 * iOS swipe-back works because this is a real native stack. `confirm-password` is a native sheet
 * (the email change asks for the password there).
 */
export default function SettingsLayout() {
  const screenOptions = useStackScreenOptions();
  const passwordSheet = useSheetOptions({ detents: 'fitToContents' });
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="account" options={{ title: 'Account Center', headerLargeTitle: false }} />
      <Stack.Screen name="confirm-password" options={passwordSheet} />
    </Stack>
  );
}
