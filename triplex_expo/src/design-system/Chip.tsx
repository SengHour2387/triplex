import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { radii, spacing } from './tokens';
import { useTheme } from './useTheme';

export interface ChipProps {
  label: string;
  /** A leading glyph. */
  icon?: IconName;
  /** A leading emoji (reaction filters). */
  emoji?: string;
  /** Filter chips: the chosen one is filled with the primary colour. */
  selected?: boolean;
  /** `accent` tints the label and glyph — for a pill that points at something (the attached trip). */
  tone?: 'neutral' | 'accent';
  /** Omit for a static pill; with it the chip is a button. */
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/** A small rounded label: a filter, or a tag on a post. */
export function Chip({ label, icon, emoji, selected = false, tone = 'neutral', onPress, accessibilityLabel, testID }: ChipProps) {
  const { colors } = useTheme();
  const foreground = selected ? colors.onPrimary : tone === 'accent' ? colors.accent : colors.text;

  const content = (
    <View style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.controlFill }]}>
      {icon ? <Icon name={icon} size={13} color={foreground} /> : null}
      {emoji ? <Text variant="footnote">{emoji}</Text> : null}
      <Text variant="footnote" weight="500" style={{ color: foreground }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={accessibilityLabel ?? label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={6}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 30,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderCurve: 'continuous',
  },
});
