import { Tabs } from 'expo-router/js-tabs';

import { useTheme } from '../useTheme';
import { DrawnTabBar } from './drawn/DrawnTabBar';
import type { AppTab } from './types';

export interface AppTabsProps {
  tabs: readonly AppTab[];
}

/**
 * The signed-in shell's bottom tabs. Android: a JS tab navigator with the drawn floating glass tab
 * bar. iOS: the system's native tab bar (`AppTabs.ios.tsx`). Each tab's route owns its own Stack, so a
 * tab keeps its place when you switch away.
 */
export function AppTabs({ tabs }: AppTabsProps) {
  const { colors } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <DrawnTabBar {...props} tabs={tabs} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
