import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

import { Glass, GlassButton, Icon, Screen, spacing, Text, useTheme } from '../../../design-system';
import { useMyProfile } from '../hooks/useMyProfile';
import { ProfileCard } from './ProfileCard';

/**
 * The Profile tab, laid out like Flutter's: one centred summary card under the app bar, pull to
 * refresh, and a retryable error state. The Posts / Drafts section below the card is added by the
 * profile and trip-plan tasks — until those features exist there is no honest content for it.
 */
export function ProfileScreen() {
  const { colors } = useTheme();
  const me = useMyProfile();

  return (
    <Screen scroll underHeader keyboardInsets={false} refreshControl={<RefreshControl refreshing={me.isRefreshing} onRefresh={me.refresh} />}>
      <View style={styles.content}>
        {me.user ? (
          <ProfileCard user={me.user} />
        ) : me.isLoading ? (
          <Glass radius="xl" style={styles.loading} accessibilityLabel="Loading your profile">
            <ActivityIndicator color={colors.textSecondary} />
          </Glass>
        ) : (
          <Glass radius="xl" style={styles.empty}>
            <Icon name={me.isOffline ? 'offline' : 'error'} size={28} color={colors.textSecondary} />
            <Text variant="headline" style={styles.center}>
              {me.isOffline ? "You're offline" : "Can't get user info"}
            </Text>
            <Text variant="subhead" color="textSecondary" style={styles.center}>
              {me.isOffline ? 'Your profile will load when you are back online.' : (me.error?.message ?? 'Please try again.')}
            </Text>
            {!me.isOffline ? <GlassButton label="Retry" variant="glass" size="compact" onPress={me.refresh} /> : null}
          </Glass>
        )}

        {me.user && me.error ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Icon name="warning" size={16} color={colors.textSecondary} />
            <Text variant="footnote" color="textSecondary" style={styles.noticeText}>
              Couldn&apos;t refresh. {me.error.message}
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingTop: spacing.md },
  loading: { height: 220, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  center: { textAlign: 'center' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingHorizontal: spacing.xs },
  noticeText: { flex: 1 },
});
