import { Stack } from 'expo-router';

import { useStackScreenOptions } from '../../../src/design-system';

/**
 * Stack of the Profile tab. Like Flutter's profile screen it has a standard (inline) centred title —
 * "Profile" — with its action button on the right, not a large title.
 */
export default function ProfileStackLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={{ ...screenOptions, headerLargeTitle: false }}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
    </Stack>
  );
}
