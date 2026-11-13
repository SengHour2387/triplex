import { StyleSheet, View } from 'react-native';

import type { User } from '../../../core/api/schemas';
import { Glass, spacing, Text } from '../../../design-system';
import { useAvatarUploadStore } from '../store/avatarUploadStore';
import { Avatar } from './Avatar';

/**
 * Flutter's profile summary card: one centred glass card — avatar, username (bold), email.
 * (Posts / Drafts stat chips join it with those features.)
 */
export function ProfileCard({ user }: { user: User }) {
  const uploadProgress = useAvatarUploadStore((s) => s.progress);
  return (
    <View style={styles.card}>
      <Avatar user={user} uploadProgress={uploadProgress} />
      <View style={styles.text} accessible accessibilityLabel={`${user.username}, ${user.email}`}>
        <Text variant="title" numberOfLines={2} style={styles.center}>
          {user.username}
        </Text>
        {user.email ? (
          <Text variant="callout" color="textSecondary" numberOfLines={2} style={styles.center}>
            {user.email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  text: { alignItems: 'center', gap: spacing.xs, alignSelf: 'stretch' },
  center: { textAlign: 'center' },
});
