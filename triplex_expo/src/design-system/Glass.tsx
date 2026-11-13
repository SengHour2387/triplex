import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { radii, type Radius } from './tokens';
import { useSurfaceMode } from './useSurfaceMode';
import { useTheme } from './useTheme';

export interface GlassProps extends ViewProps {
  children?: React.ReactNode;
  /** Corner radius token. */
  radius?: Radius;
  /** Reacts to touch (the native shimmer on iOS 26). Use for tappable surfaces. */
  interactive?: boolean;
  /**
   * For surfaces that float over *content* (menus, sheets, alerts, the tab bar). Where nothing can
   * blur (Android until it gets real blur; Reduce Transparency) the card is drawn solid, because even a
   * 94 % fill lets the text underneath ghost through. Real glass and system blur are unaffected.
   */
  opaque?: boolean;
  /** Optional colour wash. Keep subtle: text legibility is only guaranteed for the untinted material. */
  tint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The app's one glass surface (the standard "regular" material). There is deliberately no "clear"
 * variant: clear glass can't guarantee legible text over arbitrary content, so it is added only
 * when a screen needs it, together with a dimming layer behind it.
 *
 * Feature code never chooses an implementation — it asks for glass and
 * `useSurfaceMode()` decides what this device can honestly draw (see `glassTier.ts`):
 *
 *  - `liquid`  → real `UIGlassEffect` (iOS 26+)
 *  - `blur`    → system material blur (older iOS)
 *  - `frosted` → near-opaque tinted fill, no blur yet (Android — unverified until the Android pass,
 *                 which adds real blur on API 31+)
 *  - `solid`   → opaque surface (Reduce Transparency)
 */
export function Glass({
  children,
  radius = 'lg',
  interactive = false,
  opaque = false,
  tint,
  style,
  ...rest
}: GlassProps) {
  const mode = useSurfaceMode();
  const { scheme, colors } = useTheme();
  const borderRadius = radii[radius];
  const shape: ViewStyle = { borderRadius, borderCurve: 'continuous', overflow: 'hidden' };

  switch (mode) {
    case 'liquid':
      return (
        <GlassView
          {...rest}
          glassEffectStyle="regular"
          tintColor={tint}
          isInteractive={interactive}
          // Follow the app's own scheme (set via Appearance.setColorScheme), not just the OS's.
          colorScheme={scheme}
          style={[shape, style]}
        >
          {children}
        </GlassView>
      );

    case 'blur':
      return (
        <BlurView
          {...rest}
          tint="systemThinMaterial"
          intensity={85}
          style={[shape, styles.hairline, { borderColor: colors.glassBorder }, style]}
        >
          {tint ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} /> : null}
          {children}
        </BlurView>
      );

    case 'frosted':
      return (
        <View
          {...rest}
          style={[shape, styles.hairline, { backgroundColor: opaque ? colors.surface : colors.glassFill, borderColor: colors.glassBorder }, style]}
        >
          {tint ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} /> : null}
          {children}
        </View>
      );

    case 'solid':
      return (
        <View
          {...rest}
          style={[shape, styles.hairline, { backgroundColor: colors.surface, borderColor: colors.glassBorder }, style]}
        >
          {children}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  hairline: { borderWidth: StyleSheet.hairlineWidth },
});
