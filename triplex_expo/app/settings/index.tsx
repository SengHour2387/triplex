import { useRouter } from 'expo-router';

import { Toolbar } from '../../src/design-system';
import { SettingsScreen } from '../../src/features/settings';

export default function SettingsRoute() {
  const router = useRouter();
  return (
    <>
      {/* This stack's first screen has nothing under it *inside* the stack (the tabs are in the parent),
          so the header can't draw a back button by itself. */}
      <Toolbar placement="left" items={[{ type: 'button', icon: 'chevronLeft', label: 'Back', onPress: () => router.back() }]} />
      <SettingsScreen />
    </>
  );
}
