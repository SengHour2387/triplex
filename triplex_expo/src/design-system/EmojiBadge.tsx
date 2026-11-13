import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { useTheme } from './useTheme';

export interface EmojiBadgeProps {
  emoji: string;
  /** Diameter. Default fits a `CircleStack` slot of 30. */
  size?: number;
}

/**
 * An emoji on a soft round tint. Decorative: whatever it stands for is written in the label of the control
 * it belongs to, so it is hidden from screen readers.
 */
export function EmojiBadge({ emoji, size = 26 }: EmojiBadgeProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.controlFill }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text maxFontSizeMultiplier={1.2} style={{ fontSize: size * 0.7, lineHeight: size * 0.9 }}>
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
