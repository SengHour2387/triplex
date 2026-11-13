import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, Spinner, spacing, Text, useTheme } from '../../../design-system';
import { CommentComposer, CommentList, useComments, useCommentsController, useKeyboardHeight } from '../../comments';
import { usePost } from '../hooks/usePost';
import { FeedMessage } from './FeedMessage';
import { PostCard } from './PostCard';

/**
 * A post on its own — reached from a card or from `triplex://post/<id>` (so it fetches by id; it does
 * not depend on the feed having been loaded). Shows the card the feed already had while the fresh copy
 * loads, then its comments under it with the composer pinned at the bottom.
 */
export function PostDetailScreen({ postId }: { postId: string }) {
  const { post, isLoading, isOffline, isGone, error, refresh } = usePost(postId);
  const comments = useComments(post ? postId : '');
  const controller = useCommentsController(postId);
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const { colors } = useTheme();
  // Own state, not the query's `isRefetching`: opening from the feed refetches the stale card on mount,
  // which would show the pull spinner before anyone pulled.
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), comments.refresh()]);
    } finally {
      setRefreshing(false);
    }
  };

  if (post) {
    return (
      <View style={styles.fill}>
        <Screen
          scroll
          underHeader
          padded={false}
          keyboardInsets={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        >
          <View style={styles.card}>
            <PostCard post={post} variant="detail" />
          </View>
          <View style={[styles.divider, { borderTopColor: colors.separator }]}>
            <Text variant="headline" accessibilityRole="header" style={styles.heading}>
              Comments
            </Text>
            <CommentList state={comments} controller={controller} />
          </View>
        </Screen>
        <View
          style={[
            styles.composer,
            {
              paddingBottom: keyboard > 0 ? keyboard + spacing.sm : Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <CommentComposer controller={controller} />
        </View>
      </View>
    );
  }

  return (
    <Screen underHeader topInset={false}>
      {isLoading ? (
        <View style={styles.centered}>
          <Spinner size="large" label="Loading post" />
        </View>
      ) : isGone ? (
        <FeedMessage icon="info" title="This post isn't available" body="It may have been deleted." />
      ) : isOffline ? (
        <FeedMessage icon="offline" title="You're offline" body="This post will load when you are back online." />
      ) : (
        <FeedMessage icon="error" title="Couldn't load this post" body={error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void refresh()} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  card: { paddingTop: spacing.sm },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm },
  heading: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  composer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
