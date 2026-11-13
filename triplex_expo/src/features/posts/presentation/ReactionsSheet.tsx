import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Chip, GlassButton, Icon, ListRow, ListSection, SheetHeader, Spinner, spacing, Text, useTheme } from '../../../design-system';
import { usePostReactions } from '../hooks/usePostReactions';
import { reactionInfo, type ReactionType } from '../model/reactions';

/**
 * Who reacted to a post, and how (`GET likes/:postId/likes`) — a native sheet opened from the count on a
 * card. Filter chips narrow the list by reaction; the totals come from the per-type counts, because the
 * server only lists the 50 most recent people.
 */
export function ReactionsSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { data, isLoading, isOffline, error, retry } = usePostReactions(postId);
  const [filter, setFilter] = useState<'all' | ReactionType>('all');

  const users = useMemo(() => (data ? (filter === 'all' ? data.users : data.users.filter((u) => u.type === filter)) : []), [data, filter]);
  const capped = data !== undefined && filter === 'all' && data.users.length < data.total;

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
      {/* Header and chips are one block: a formSheet with a ScrollView takes exactly two children, and the
          first needs `collapsable={false}` (see RepostSheet). */}
      <View style={styles.header} collapsable={false}>
        <View style={styles.pad}>
          <SheetHeader title="Reactions" onClose={() => router.back()} />
        </View>
        {data && data.total > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
            <Chip label={`All ${data.total}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
            {data.reactions.map((r) => (
              <Chip key={r.type} emoji={reactionInfo(r.type).emoji} label={String(r.count)} accessibilityLabel={`${reactionInfo(r.type).label}, ${r.count}`} selected={filter === r.type} onPress={() => setFilter(r.type)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner size="large" label="Loading reactions" />
        </View>
      ) : isOffline ? (
        <View style={styles.center}>
          <Icon name="offline" size={36} color={colors.textSecondary} />
          <Text variant="subhead" color="textSecondary">
            You&apos;re offline.
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text variant="subhead" color="textSecondary" style={styles.message}>
            {error.message}
          </Text>
          <GlassButton label="Try again" variant="glass" size="compact" onPress={retry} />
        </View>
      ) : !data || data.total === 0 ? (
        <View style={styles.center}>
          <Text variant="subhead" color="textSecondary">
            No reactions yet.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.fill} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <ListSection footer={capped ? `Showing the ${data.users.length} most recent reactions.` : undefined}>
            {users.map((user) => (
              <ListRow
                key={`${user.userId}-${user.type}`}
                title={user.name ?? user.username}
                subtitle={`@${user.username}`}
                value={reactionInfo(user.type).emoji}
                leading={<Avatar uri={user.avatarUrl} name={user.name ?? user.username} size={40} />}
                leadingSize={40}
              />
            ))}
          </ListSection>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing.xl },
  header: { paddingHorizontal: 0 },
  pad: { paddingHorizontal: spacing.xl },
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  message: { textAlign: 'center' },
  chipScroll: { flexGrow: 0, marginTop: spacing.lg },
  chips: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  list: { padding: spacing.lg },
});
