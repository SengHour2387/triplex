import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, Text, useTheme } from '../../../design-system';
import type { UsernameStatus } from '../model/accountForm';

/** The availability line under the username field: checking / available / couldn't check. */
export function UsernameStatusLine({ status }: { status: UsernameStatus }) {
  const { colors } = useTheme();

  if (status === 'checking') {
    return (
      <View style={styles.row} accessibilityLiveRegion="polite">
        <ActivityIndicator size="small" color={colors.textSecondary} />
        <Text variant="footnote" color="textSecondary">
          Checking availability…
        </Text>
      </View>
    );
  }
  if (status === 'available') {
    return (
      <View style={styles.row} accessibilityLiveRegion="polite">
        <Text variant="footnote" style={{ color: colors.toast.success.fg }} weight="500">
          Username is available
        </Text>
      </View>
    );
  }
  if (status === 'unverified') {
    return (
      <View style={styles.row}>
        <Text variant="footnote" color="textSecondary">
          Couldn&apos;t check availability. We&apos;ll check again when you save.
        </Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs, marginHorizontal: spacing.xs },
});
