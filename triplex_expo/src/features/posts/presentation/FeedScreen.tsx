import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ProgressiveBlur, Spinner, spacing, Text, useExpandTabBarOnScrollUp, useFontScale, useScrollInsets, useTheme } from '../../../design-system';
import { useFeed } from '../hooks/useFeed';
import type { Post } from '../model/post';
import { FeedMessage } from './FeedMessage';
import { PostCard } from './PostCard';

const keyExtractor = (post: Post) => post.id;
const renderPost = ({ item }: { item: Post }) => <PostCard post={item} />;

/** A hairline between posts, edge to edge. */
function Separator() {
  const { colors } = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.separator }]} />;
}

/**
 * The "Feed" wordmark. It is the first thing *in the list*, not a fixed header: it scrolls away with the
 * posts so the feed has the whole screen (the owner asked for less chrome). The logo font only exists in
 * bold, so it is kept small.
 */
function FeedTitle() {
  const fontScale = useFontScale();
  return (
    <View style={styles.title}>
      <Text variant="pageTitle" accessibilityRole="header" style={{ fontSize: 24, lineHeight: Math.round(32 * fontScale) }}>
        Feed
      </Text>
    </View>
  );
}

/**
 * The Feed tab. The list is the screen's *first and only child* — native tabs follow it for the
 * scroll-to-minimise behaviour — so the empty / offline / error states are the list's own empty
 * component (which also keeps pull-to-refresh working in them). Never shows made-up posts: when there
 * is nothing, it says so.
 */
export function FeedScreen() {
  const { colors } = useTheme();
  const feed = useFeed();
  const onScroll = useExpandTabBarOnScrollUp();
  const inset = useScrollInsets();

  const empty =
    feed.status === 'loading' ? (
      <View style={styles.centered}>
        <Spinner size="large" label="Loading your feed" />
      </View>
    ) : feed.status === 'offline' ? (
      <FeedMessage icon="offline" title="You're offline" body="Your feed will load when you are back online." />
    ) : feed.status === 'error' ? (
      <FeedMessage icon="error" title="Couldn't load your feed" body={feed.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void feed.refresh()} />
    ) : (
      <FeedMessage icon="feed" title="No posts in your feed yet" body="Posts and trip plans from you and others will appear here." actionLabel="Refresh" onAction={() => void feed.refresh()} />
    );

  return (
    <>
      <FlatList
        testID="feed-list"
        data={feed.posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={FeedTitle}
        ListEmptyComponent={empty}
        refreshControl={<RefreshControl refreshing={feed.refreshing} onRefresh={() => void feed.refresh()} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={7}
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[feed.posts.length === 0 && styles.grow, { paddingTop: inset.top, paddingBottom: spacing.xl + inset.bottom }]}
      />
      {/* Posts scroll under the status bar: blur it so the clock stays legible. */}
      <ProgressiveBlur />
    </>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
  title: { alignItems: 'center', paddingVertical: spacing.md },
  separator: { height: StyleSheet.hairlineWidth },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
