import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Glass, spacing, Text, viewerHref } from '../../../design-system';
import { authorName, type Post } from '../model/post';
import { formatRelativeTime } from '../model/format';
import { MediaCarousel } from './MediaCarousel';
import { TripPlanCard } from './TripPlanCard';

/**
 * The original post inside a repost (and in the repost sheet's preview): author, caption (4 lines), its
 * photos and trip plan. Tapping it opens the original. `post` is null when the original was deleted —
 * the card then says so instead of vanishing.
 */
export function EmbeddedPost({ post, interactive = true }: { post: Post | null; /** False in the repost sheet's preview, where opening the post would leave the sheet. */ interactive?: boolean }) {
  const router = useRouter();

  if (post === null) {
    return (
      <Glass radius="lg" style={styles.card}>
        <Text variant="subhead" color="textSecondary">
          This post is no longer available.
        </Text>
      </Glass>
    );
  }

  return (
    <Pressable
      accessibilityRole={interactive ? 'button' : 'summary'}
      accessibilityLabel={`Original post by ${authorName(post.author)}${post.caption ? `: ${post.caption}` : ''}`}
      accessibilityHint={interactive ? 'Opens the original post' : undefined}
      disabled={!interactive}
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
    >
      <Glass radius="lg" style={styles.card}>
        <View style={styles.header}>
          <Avatar uri={post.author.avatarUrl} name={authorName(post.author)} size={28} />
          <Text variant="subhead" weight="500" numberOfLines={1} style={styles.name}>
            {authorName(post.author)}
          </Text>
          <Text variant="subhead" color="textSecondary">
            {formatRelativeTime(post.createdAt)}
          </Text>
        </View>

        {post.caption ? (
          <Text variant="body" numberOfLines={4}>
            {post.caption}
          </Text>
        ) : null}

        {post.images.length > 0 ? <MediaCarousel images={post.images} inset={0} radius={10} onOpen={(i) => interactive && router.push(viewerHref(post.images, i))} /> : null}
        {post.tripPlan ? <TripPlanCard plan={post.tripPlan} /> : null}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1 },
});
