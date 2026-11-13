import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { memo, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Chip, CircleStack, EmojiBadge, Icon, spacing, Text, useTheme, viewerHref, type IconName } from '../../../design-system';
import { useReactionSummary } from '../hooks/useReactionSummary';
import { useReactions } from '../hooks/useReactions';
import { formatCount, formatRelativeTime } from '../model/format';
import type { Rect } from '../model/pickerPosition';
import { repostTarget, type Post } from '../model/post';
import { REACTIONS, reactionInfo, type ReactionType } from '../model/reactions';
import { otherReactionTypes } from '../model/reactionSummary';
import { EmbeddedPost } from './EmbeddedPost';
import { MediaCarousel } from './MediaCarousel';
import { ReactionPicker } from './ReactionPicker';
import { TripPlanCard } from './TripPlanCard';

export interface PostCardProps {
  post: Post;
  /** `feed` cards open the post when tapped; `detail` is the post itself, so nothing opens. */
  variant?: 'feed' | 'detail';
}

/**
 * One post, laid out like Flutter's `PostCard`: author row, caption (with the attached trip as a pill),
 * photos edge to edge, the trip plan, the embedded original for a repost, and a footer with reactions,
 * comments and reposts. Flutter's share and "saved" counters were never real, and are not here.
 *
 * Reactions: tap the heart to like / take it back; touch and hold for the seven-reaction bar. Screen
 * readers get the seven as custom actions on the same button.
 */
export const PostCard = memo(function PostCard({ post, variant = 'feed' }: PostCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { tap, pick } = useReactions();
  const likeRef = useRef<View>(null);
  const [pickerAnchor, setPickerAnchor] = useState<Rect | null>(null);

  const isRepost = post.repostId !== null;
  const original = repostTarget(post);
  const reaction = post.myReaction ? reactionInfo(post.myReaction) : null;
  // Everyone's top reactions. The cluster in the footer puts the heart (or your own reaction) in front and
  // the other top reactions tucked behind it.
  const top = useReactionSummary(post.id, post.reactionCount);
  const behind = otherReactionTypes(top, post.myReaction);
  // Say the breakdown aloud unless it is only the user's own (already named by the like button).
  const mostly = top.length === 1 && top[0] === post.myReaction ? [] : top;
  const reactionsLabel = `${post.reactionCount} ${post.reactionCount === 1 ? 'reaction' : 'reactions'}${mostly.length > 0 ? `, mostly ${mostly.map((t) => reactionInfo(t).label).join(', ')}` : ''}`;

  const openDetail = useCallback(() => router.push({ pathname: '/post/[id]', params: { id: post.id } }), [router, post.id]);
  const openReactions = () => router.push({ pathname: '/reactions/[postId]', params: { postId: post.id } });
  const openComments = () => router.push({ pathname: '/comments/[postId]', params: { postId: post.id } });
  const openRepost = () => router.push({ pathname: '/repost/[postId]', params: { postId: post.id } });

  const onLike = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    tap(post);
  };
  const onLikeLongPress = () => {
    likeRef.current?.measureInWindow((x, y, width, height) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      setPickerAnchor({ x, y, width, height });
    });
  };
  const onPick = (type: ReactionType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setPickerAnchor(null);
    pick(post, type);
  };

  const author = post.author.username;
  return (
    <Pressable accessible={false} onPress={variant === 'feed' ? openDetail : undefined} style={styles.card}>
      <View style={styles.padded}>
        <View style={styles.header}>
          <Avatar uri={post.author.avatarUrl} name={author} size={40} />
          <View style={styles.nameRow}>
            <Text variant="body" weight="500" numberOfLines={1} style={styles.name}>
              {author}
            </Text>
            <Text variant="body" color="textSecondary">
              {formatRelativeTime(post.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {post.caption ? (
        <View style={[styles.padded, styles.caption]}>
          <Text variant="body" style={styles.captionText}>
            {post.caption}
          </Text>
          {post.tripPlan ? <Chip icon="trip" label={post.tripPlan.title} tone="accent" /> : null}
        </View>
      ) : null}

      {post.images.length > 0 ? (
        <View style={styles.media}>
          <MediaCarousel images={post.images} onOpen={(i) => router.push(viewerHref(post.images, i))} />
        </View>
      ) : null}

      {post.tripPlan ? (
        <View style={[styles.padded, styles.block]}>
          <TripPlanCard plan={post.tripPlan} />
        </View>
      ) : null}

      {isRepost ? (
        <View style={[styles.padded, styles.block]}>
          <EmbeddedPost post={post.repostedPost} />
        </View>
      ) : null}

      <View style={[styles.padded, styles.footer]}>
        <View style={styles.group}>
          {/* One overlapping row: the like button in front — the heart, or your reaction once you have one —
              with everyone's other top reactions peeking out behind it. */}
          <CircleStack size={CLUSTER}>
            <Pressable
              ref={likeRef}
              accessibilityRole="button"
              accessibilityLabel={reaction ? `Your reaction: ${reaction.label}. Double tap to remove it.` : 'Like'}
              accessibilityHint="Touch and hold to choose another reaction"
              accessibilityActions={REACTIONS.map((r) => ({ name: r.type, label: r.label }))}
              onAccessibilityAction={(event) => pick(post, event.nativeEvent.actionName as ReactionType)}
              onPress={onLike}
              onLongPress={onLikeLongPress}
              delayLongPress={300}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 4 }}
              style={styles.leader}
            >
              {reaction ? <EmojiBadge emoji={reaction.emoji} size={CLUSTER - 4} /> : <Icon name="heart" size={ICON} color={colors.textSecondary} />}
            </Pressable>
            {behind.map((type) => (
              <Pressable key={type} accessible={false} onPress={openReactions} style={styles.leader}>
                <EmojiBadge emoji={reactionInfo(type).emoji} size={CLUSTER - 4} />
              </Pressable>
            ))}
          </CircleStack>
          <Pressable
            disabled={post.reactionCount === 0}
            accessibilityRole="button"
            accessibilityLabel={reactionsLabel}
            accessibilityHint="Shows who reacted"
            onPress={openReactions}
            hitSlop={{ top: 12, bottom: 12, left: 4, right: 8 }}
          >
            <Text variant="callout">{formatCount(post.reactionCount)}</Text>
          </Pressable>
        </View>

        <Stat
          icon="comment"
          count={post.commentCount}
          label={`${post.commentCount} ${post.commentCount === 1 ? 'comment' : 'comments'}`}
          hint={variant === 'feed' ? 'Opens the comments' : undefined}
          onPress={variant === 'feed' ? openComments : undefined}
        />

        <Stat
          icon="repost"
          count={post.repostCount}
          label={`${post.repostCount} ${post.repostCount === 1 ? 'repost' : 'reposts'}${post.isReposted ? ', including yours' : ''}`}
          hint="Opens the repost sheet"
          active={post.isReposted}
          disabled={original === null}
          onPress={openRepost}
        />
      </View>

      <ReactionPicker anchor={pickerAnchor} current={post.myReaction} onSelect={onPick} onDismiss={() => setPickerAnchor(null)} />
    </Pressable>
  );
});

interface StatProps {
  icon: IconName;
  count: number;
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

/** An icon with a count. A button when it has somewhere to go, plain text otherwise. */
function Stat({ icon, count, label, hint, active = false, disabled = false, onPress }: StatProps) {
  const { colors } = useTheme();
  const tint = active ? colors.accent : colors.textSecondary;
  const content = (
    <View style={styles.action}>
      <Icon name={icon} size={ICON} color={tint} />
      <Text variant="callout" style={active ? { color: colors.accent } : undefined}>
        {formatCount(count)}
      </Text>
    </View>
  );
  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }} style={{ opacity: disabled ? 0.4 : 1 }}>
      {content}
    </Pressable>
  );
}

/** Footer glyph size — Threads' are ~22 pt on a 17-pt body. */
const ICON = 22;
/** Diameter of one slot in the reaction cluster (heart / reactions), ring included. */
const CLUSTER = 30;

const styles = StyleSheet.create({
  card: { paddingTop: spacing.md, gap: spacing.md },
  padded: { paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameRow: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  name: { flexShrink: 1 },
  caption: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.sm, rowGap: spacing.xs },
  captionText: { flexShrink: 1 },
  media: { alignSelf: 'stretch' },
  block: { gap: spacing.sm },
  // Wraps instead of overflowing at the largest accessibility text sizes.
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.xl, rowGap: spacing.sm, paddingBottom: spacing.md },
  group: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  leader: { width: CLUSTER - 4, height: CLUSTER - 4, alignItems: 'center', justifyContent: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 30 },
});
