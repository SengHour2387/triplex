import { Pressable, StyleSheet, View } from 'react-native';

import type { User } from '../../../core/api/schemas';
import { Glass, Icon, spacing, Text, useFontScale, useTheme } from '../../../design-system';
import { displayName } from '../../profile/model/displayName';

/** Settings' entry to the account center: name, username and email at a glance. */
export function AccountCard({ user, onPress }: { user: User; onPress: () => void }) {
  const { colors } = useTheme();
  const name = displayName(user);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Account Center. ${name}, @${user.username}, ${user.email}`}
      onPress={onPress}
      testID="open-account"
    >
      <Glass interactive radius="xl" style={styles.card}>
        <View style={styles.header}>
          <Text variant="headline">Account Center</Text>
          <Icon name="chevronRight" size={14} color={colors.textSecondary} />
        </View>
        <Line label="Name" value={name} />
        <Line label="Username" value={`@${user.username}`} />
        <Line label="Email" value={user.email} />
      </Glass>
    </Pressable>
  );
}

/** Label beside the value; stacked above it at large text sizes, where a fixed label column breaks words. */
const STACK_FROM_SCALE = 1.25;

function Line({ label, value }: { label: string; value: string }) {
  const stacked = useFontScale() >= STACK_FROM_SCALE;
  return (
    <View style={stacked ? styles.lineStacked : styles.line}>
      <Text variant="subhead" color="textSecondary" style={stacked ? undefined : styles.label}>
        {label}
      </Text>
      <Text variant="subhead" style={stacked ? undefined : styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  line: { flexDirection: 'row', gap: spacing.md },
  lineStacked: { gap: 0 },
  label: { width: 84 },
  value: { flex: 1 },
});
