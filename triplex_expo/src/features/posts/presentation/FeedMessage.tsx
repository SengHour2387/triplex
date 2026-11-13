import { StyleSheet, View } from 'react-native';

import { GlassButton, Icon, spacing, Text, useTheme, type IconName } from '../../../design-system';

export interface FeedMessageProps {
  icon: IconName;
  title: string;
  body: string;
  /** The recovery action ("Try again"). Omit when waiting is the only option (offline). */
  actionLabel?: string;
  onAction?: () => void;
}

/** A full-area message for the states that have no posts to show: empty, offline, failed. */
export function FeedMessage({ icon, title, body, actionLabel, onAction }: FeedMessageProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <Icon name={icon} size={44} color={colors.textSecondary} />
      <Text variant="headline" style={styles.center} accessibilityRole="header">
        {title}
      </Text>
      <Text variant="subhead" color="textSecondary" style={styles.center}>
        {body}
      </Text>
      {actionLabel && onAction ? <GlassButton label={actionLabel} icon="refresh" variant="glass" size="compact" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  center: { textAlign: 'center' },
});
