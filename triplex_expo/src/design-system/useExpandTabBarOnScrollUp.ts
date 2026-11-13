import { useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { nextMinimizeBehavior, useTabBarMinimize } from './tabBarMinimize';

/**
 * `onScroll` handler for the main scroll view of a tab: expands the minimised iOS 26 tab bar when
 * the user scrolls back up (see `nextMinimizeBehavior`). Pair with `scrollEventThrottle={16}`.
 */
export function useExpandTabBarOnScrollUp() {
  const last = useRef<number | null>(null);
  const anchor = useRef(0);
  const setBehavior = useTabBarMinimize((s) => s.setBehavior);

  return (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (last.current === null) {
      last.current = y;
      anchor.current = y;
      return;
    }
    // Direction changes restart the measurement, so the threshold is *continuous* travel.
    if (Math.sign(y - last.current) !== Math.sign(last.current - anchor.current)) anchor.current = last.current;
    last.current = y;
    setBehavior(nextMinimizeBehavior(useTabBarMinimize.getState().behavior, y - anchor.current));
  };
}
