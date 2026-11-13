import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTabBarColors } from '../useTabBarColors';
import { useTabBarMinimize } from '../tabBarMinimize';
import type { AppTab } from './types';

export interface AppTabsProps {
  tabs: readonly AppTab[];
}

/**
 * iOS: the system's own tab bar (`NativeTabs`) — floating Liquid Glass on iOS 26 (minimising as you
 * scroll), the classic UIKit bar below. Android draws its own (`AppTabs.tsx`).
 */
export function AppTabs({ tabs }: AppTabsProps) {
  const tabBarColors = useTabBarColors();
  const minimizeBehavior = useTabBarMinimize((s) => s.behavior);

  return (
    <NativeTabs {...tabBarColors} minimizeBehavior={minimizeBehavior}>
      {tabs.map((tab) =>
        tab.badge === undefined ? (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon sf={tab.icon.sf} />
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ) : (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon sf={tab.icon.sf} />
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Badge>{String(tab.badge)}</NativeTabs.Trigger.Badge>
          </NativeTabs.Trigger>
        ),
      )}
    </NativeTabs>
  );
}
