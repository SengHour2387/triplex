import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { useDevSurfaceOverride } from './devSurfaceOverride';
import { resolveSurfaceMode, type SurfaceMode } from './glassTier';

let cachedLiquid: boolean | undefined;
/**
 * Whether the *system* can draw Liquid Glass (iOS 26+ and the app built to use it). Queried once:
 * it can't change while the app runs. Also the test for "does the OS draw native sheet glass".
 */
export function isSystemGlassAvailable(): boolean {
  cachedLiquid ??= Platform.OS === 'ios' && isLiquidGlassAvailable();
  return cachedLiquid;
}

/** Live value of the system "Reduce Transparency" setting. */
export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (active) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}

/** What kind of surface glass should render as on this device, right now. */
export function useSurfaceMode(): SurfaceMode {
  const reduceTransparency = useReduceTransparency();
  const override = useDevSurfaceOverride((s) => s.mode);
  if (override) return override;
  return resolveSurfaceMode({
    os: Platform.OS,
    liquidGlassAvailable: isSystemGlassAvailable(),
    reduceTransparency,
  });
}
