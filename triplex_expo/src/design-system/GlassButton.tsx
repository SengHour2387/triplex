import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Glass } from './Glass';
import { Icon } from './Icon';
import { Text } from './Text';
import { radii, spacing } from './tokens';
import { useTheme } from './useTheme';
import type { IconName } from './icons';

export type GlassButtonVariant = 'prominent' | 'glass' | 'plain';

export interface GlassButtonProps {
  label: string;
  onPress?: () => void;
  /**
   * - `prominent` — solid, high-contrast (black in light / white in dark, as in Flutter). The primary action.
   * - `glass`     — Liquid Glass (or its fallback). Secondary actions floating over content.
   * - `plain`     — text only. Tertiary actions and links.
   */
  variant?: GlassButtonVariant;
  size?: 'regular' | 'compact';
  icon?: IconName;
  /** Shows a spinner and blocks presses; the width does not change. */
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT = { regular: 52, compact: 38 } as const;

export function GlassButton({
  label,
  onPress,
  variant = 'prominent',
  size = 'regular',
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: GlassButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const inactive = disabled || loading;
  const labelColor =
    variant === 'prominent' ? colors.onPrimary : variant === 'plain' ? colors.accent : colors.text;

  const content = (
    <View style={styles.row}>
      {/* The label stays mounted while loading so the button never changes width. */}
      <View style={[styles.row, loading && styles.hidden]}>
        {icon ? <Icon name={icon} size={size === 'compact' ? 16 : 18} color={labelColor} /> : null}
        <Text variant={size === 'compact' ? 'subhead' : 'headline'} weight="600" style={{ color: labelColor }}>
          {label}
        </Text>
      </View>
      {loading ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.spinner}>
            <ActivityIndicator color={labelColor} />
          </View>
        </View>
      ) : null}
    </View>
  );

  const box: ViewStyle = { minHeight: HEIGHT[size], paddingHorizontal: size === 'compact' ? spacing.lg : spacing.xl };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => {
        if (!reduceMotion) scale.set(withTiming(0.97, { duration: 90 }));
      }}
      onPressOut={() => {
        scale.set(withTiming(1, { duration: 140 }));
      }}
      hitSlop={size === 'compact' ? 6 : 0}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      <Animated.View style={pressStyle}>
        {variant === 'glass' ? (
          <Glass interactive radius="pill" style={[styles.center, box]}>
            {content}
          </Glass>
        ) : variant === 'prominent' ? (
          <View style={[styles.center, box, { backgroundColor: colors.primary, borderRadius: radii.pill, borderCurve: 'continuous' }]}>
            {content}
          </View>
        ) : (
          <View style={[styles.center, box]}>{content}</View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  hidden: { opacity: 0 },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
