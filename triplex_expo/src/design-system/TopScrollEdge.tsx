import type { ReactElement } from 'react';
import { ScrollViewMarker } from 'react-native-screens/experimental';

import { ProgressiveBlur } from './ProgressiveBlur';
import { isSystemGlassAvailable } from './useSurfaceMode';

export interface TopScrollEdgeProps {
  /** Exactly one child: the scroll view (`FlatList`, `ScrollView`, …) whose content slides under the status bar. */
  children: ReactElement;
}

/**
 * Keeps scroll content legible where it slides under the status bar.
 *
 * - **iOS 26+:** the *system's* soft scroll-edge effect (`UIScrollEdgeEffect`, what SwiftUI calls
 *   `.scrollEdgeEffectStyle(.soft, for: .top)`), applied to the wrapped scroll view through
 *   react-native-screens' `ScrollViewMarker`. Native blur + fade, no drawn overlay.
 * - **Older iOS / Android:** the drawn {@link ProgressiveBlur} fallback.
 *
 * The wrapped scroll view must be the single direct child.
 */
export function TopScrollEdge({ children }: TopScrollEdgeProps) {
  if (isSystemGlassAvailable()) {
    return (
      <ScrollViewMarker style={{ flex: 1 }} scrollEdgeEffects={{ top: 'soft' }}>
        {children}
      </ScrollViewMarker>
    );
  }
  return (
    <>
      {children}
      <ProgressiveBlur />
    </>
  );
}
