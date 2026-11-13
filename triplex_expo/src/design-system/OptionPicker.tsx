import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from './Glass';
import type { OptionPickerProps } from './optionPickerTypes';
import { Text } from './Text';
import { radii, spacing } from './tokens';
import { useTheme } from './useTheme';

/**
 * Non-iOS segmented control, drawn with the design system (a glass track and a solid selected
 * segment) rather than stock Material. iOS gets the system control from `OptionPicker.ios.tsx`.
 * UNVERIFIED on Android until the Android pass (TODO-001).
 */
export function OptionPicker<T extends string>({ label, value, options, onChange }: OptionPickerProps<T>) {
  const { colors } = useTheme();
  return (
    <Glass radius="pill" style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={styles.segmentHit}
          >
            <View style={[styles.segment, selected && { backgroundColor: colors.primary }]}>
              <Text variant="subhead" weight="600" style={{ color: selected ? colors.onPrimary : colors.text }}>
                {option.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </Glass>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3 },
  segmentHit: { flex: 1 },
  segment: { minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, paddingHorizontal: spacing.sm },
});
