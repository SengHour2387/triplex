import { Pressable, StyleSheet, View } from 'react-native';

import { ExpandReveal, Spinner, spacing, Text, useTheme } from '../../../design-system';
import type { Comment } from '../model/comment';
import { useReplies } from '../hooks/useComments';
import { CommentRow } from './CommentRow';

export interface CommentThreadProps {
  comment: Comment;
  currentUserId: string | null;
  open: boolean;
  onToggle: () => void;
  onReply: (comment: Comment) => void;
}

/** A top-level comment and, under it, its replies — loaded only when the thread is opened ("View 3 replies"). One level deep. */
export function CommentThread({ comment, currentUserId, open, onToggle, onReply }: CommentThreadProps) {
  const { colors } = useTheme();
  const { replies, isLoading, isOffline, error, retry } = useReplies(comment.id, open && !comment.pending);
  const isMine = (c: Comment) => currentUserId !== null && c.author?.id === currentUserId;

  return (
    <View>
      <CommentRow comment={comment} mine={isMine(comment)} onReply={onReply} />

      {comment.replyCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={open ? 'Hide replies' : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
          onPress={onToggle}
          hitSlop={{ top: 8, bottom: 8 }}
          style={styles.toggle}
        >
          <View style={[styles.rule, { backgroundColor: colors.separator }]} />
          {open && isLoading ? <Spinner size="small" label="Loading replies" /> : null}
          <Text variant="footnote" weight="500" color="textSecondary">
            {open ? 'Hide replies' : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
          </Text>
        </Pressable>
      ) : null}

      <ExpandReveal open={open}>
        <View>
          {(replies ?? []).map((reply) => (
            <CommentRow key={reply.id} comment={reply} isReply mine={isMine(reply)} onReply={onReply} />
          ))}
          {isOffline ? (
            <Text variant="footnote" color="textSecondary" style={styles.note}>
              You&apos;re offline. Replies will load when you are back online.
            </Text>
          ) : error ? (
            <Pressable accessibilityRole="button" onPress={retry} style={styles.note}>
              <Text variant="footnote" color="error">{`${error.message} Tap to try again.`}</Text>
            </Pressable>
          ) : null}
        </View>
      </ExpandReveal>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingLeft: 36 + spacing.md, paddingVertical: spacing.xs },
  rule: { width: 20, height: StyleSheet.hairlineWidth * 2 },
  note: { paddingLeft: 36 + spacing.md + 28 + spacing.md, paddingVertical: spacing.xs },
});
