import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from './Glass';
import { Icon } from './Icon';
import type { IconName } from './icons';
import { Text } from './Text';
import { spacing } from './tokens';
import { useTheme } from './useTheme';

export interface GlassRowProps {
  label: string;
  icon?: IconName;
  onPress: () => void;
  accessibilityHint?: string;
  testID?: string;
}

/** A full-width tappable row on a glass surface: icon, label, chevron. Navigation entries. */
export function GlassRow({ label, icon, onPress, accessibilityHint, testID }: GlassRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={accessibilityHint} onPress={onPress}>
      <Glass interactive radius="lg" style={styles.row}>
        {icon ? <Icon name={icon} size={20} color={colors.text} /> : null}
        <View style={styles.label}>
          <Text variant="body" numberOfLines={2}>
            {label}
          </Text>
        </View>
        <Icon name="chevronRight" size={14} color={colors.textSecondary} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { flex: 1 },
});
