import type { Ref } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Glass } from '../../Glass';
import { useTheme } from '../../useTheme';

export const ICON_BUTTON_SIZE = 44;

export interface GlassIconButtonProps {
  /** The glyph. */
  children: React.ReactNode;
  /** Accessible name — icon-only, so it is the only description. */
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  /** No glass of its own — for use *inside* a grouped capsule (see `ToolbarItems`). */
  bare?: boolean;
  ref?: Ref<View>;
  style?: StyleProp<ViewStyle>;
}

/**
 * The circular glass button of an iOS 26 toolbar (back, share, more…). Drawn for Android's header;
 * iOS gets the system toolbar buttons. The glyph is passed in so a header can use any icon.
 */
export function GlassIconButton({ children, label, onPress, disabled = false, testID, bare = false, ref, style }: GlassIconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      ref={ref}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      {bare ? (
        <View style={styles.circle}>{children}</View>
      ) : (
        <Glass interactive radius="pill" style={[styles.circle, { borderColor: colors.glassBorder }]}>
          {children}
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: { width: ICON_BUTTON_SIZE, height: ICON_BUTTON_SIZE, alignItems: 'center', justifyContent: 'center' },
});
