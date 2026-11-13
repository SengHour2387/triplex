import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, confirm, EmojiBadge, Icon, spacing, Text, useTheme } from '../../../design-system';
import { formatCount, formatRelativeTime, ReactionPicker, REACTIONS, reactionInfo, type ReactionType, type Rect } from '../../posts';
import { DELETED_TEXT, type Comment } from '../model/comment';
import { useCommentReactions } from '../hooks/useCommentReactions';
import { useDeleteComment } from '../hooks/useCommentMutations';

export interface CommentRowProps {
  comment: Comment;
  /** Smaller, indented: a reply under a top-level comment. */
  isReply?: boolean;
  /** Whether the signed-in user wrote it — only then can it be deleted. */
  mine: boolean;
  onReply: (comment: Comment) => void;
}

const AVATAR = { top: 36, reply: 28 } as const;
const HEART = 16;

/**
 * One comment, like Flutter's `CommentTile`: avatar, name and age, the text, then like (tap, or hold for the
 * seven reactions) and Reply; your own can be deleted from the ⋯ button, after a confirmation. A comment that
 * is still being saved is dimmed and can't be acted on; a deleted one reads "This comment was deleted.".
 */
export function CommentRow({ comment, isReply = false, mine, onReply }: CommentRowProps) {
  const { colors } = useTheme();
  const { tap, pick } = useCommentReactions();
  const remove = useDeleteComment();
  const likeRef = useRef<View>(null);
  const [pickerAnchor, setPickerAnchor] = useState<Rect | null>(null);

  const size = isReply ? AVATAR.reply : AVATAR.top;
  const name = comment.author?.username ?? '';
  const reaction = comment.myReaction ? reactionInfo(comment.myReaction) : null;
  const locked = comment.pending || comment.isDeleted;

  const onLike = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    tap(comment);
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
    pick(comment, type);
  };
  const askDelete = async () => {
    const yes = await confirm({ title: 'Delete comment?', message: "This can't be undone.", confirmLabel: 'Delete', destructive: true });
    if (yes) remove(comment);
  };

  return (
    <View style={[styles.row, isReply && styles.reply]} accessibilityLabel={comment.isDeleted ? DELETED_TEXT : undefined}>
      {comment.author ? <Avatar uri={comment.author.avatarUrl} name={name} size={size} /> : <View style={{ width: size, height: size }} />}

      <View style={styles.body}>
        {comment.isDeleted ? (
          <Text variant="callout" color="textSecondary" style={styles.deleted}>
            {DELETED_TEXT}
          </Text>
        ) : (
          <>
            <View style={styles.head}>
              <Text variant="subhead" weight="500" numberOfLines={1} style={styles.name}>
                {name}
              </Text>
              <Text variant="subhead" color="textSecondary">
                {comment.pending ? 'Sending…' : formatRelativeTime(comment.createdAt)}
              </Text>
              {mine && !locked ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Delete comment" onPress={() => void askDelete()} hitSlop={12} style={styles.more}>
                  <Icon name="more" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            <Text variant="callout" style={comment.pending ? styles.dim : undefined}>
              {comment.content}
            </Text>

            {!comment.pending ? (
              <View style={styles.actions}>
                <Pressable
                  ref={likeRef}
                  accessibilityRole="button"
                  accessibilityLabel={reaction ? `Your reaction: ${reaction.label}. Double tap to remove it.` : 'Like'}
                  accessibilityHint="Touch and hold to choose another reaction"
                  accessibilityActions={REACTIONS.map((r) => ({ name: r.type, label: r.label }))}
                  onAccessibilityAction={(event) => pick(comment, event.nativeEvent.actionName as ReactionType)}
                  onPress={onLike}
                  onLongPress={onLikeLongPress}
                  delayLongPress={300}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  style={styles.action}
                >
                  {reaction ? <EmojiBadge emoji={reaction.emoji} size={HEART + 4} /> : <Icon name="heart" size={HEART} color={colors.textSecondary} />}
                  {comment.reactionCount > 0 ? <Text variant="footnote" weight="500" color="textSecondary">{formatCount(comment.reactionCount)}</Text> : null}
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Reply to ${name}`} onPress={() => onReply(comment)} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                  <Text variant="footnote" weight="500" color="textSecondary">
                    Reply
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </View>

      <ReactionPicker anchor={pickerAnchor} current={comment.myReaction} onSelect={onPick} onDismiss={() => setPickerAnchor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  reply: { paddingLeft: 36 + spacing.md },
  body: { flex: 1, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  name: { flexShrink: 1 },
  more: { marginLeft: 'auto', alignSelf: 'center' },
  deleted: { fontStyle: 'italic', paddingTop: 4 },
  dim: { opacity: 0.6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
