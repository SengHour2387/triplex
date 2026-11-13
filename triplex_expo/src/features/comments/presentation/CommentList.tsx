import { StyleSheet, View } from 'react-native';

import { Spinner, spacing } from '../../../design-system';
import { FeedMessage } from '../../posts';
import type { CommentsState } from '../hooks/useComments';
import type { CommentsController } from '../hooks/useCommentsController';
import { CommentThread } from './CommentThread';

export interface CommentListProps {
  state: CommentsState;
  controller: CommentsController;
}

/** A post's comments, oldest first — or the honest reason there are none to show (loading, offline, failed, empty). */
export function CommentList({ state, controller }: CommentListProps) {
  const { comments, isLoading, isOffline, error, refresh } = state;

  if (comments) {
    if (comments.length === 0) {
      return (
        <View style={styles.message}>
          <FeedMessage icon="comment" title="No comments yet" body="Be the first to share what you think!" />
        </View>
      );
    }
    return (
      <View style={styles.list}>
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            currentUserId={controller.me?.id ?? null}
            open={controller.expanded.has(comment.id)}
            onToggle={() => controller.toggleThread(comment.id)}
            onReply={controller.startReply}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.message}>
      {isLoading ? (
        <Spinner size="large" label="Loading comments" />
      ) : isOffline ? (
        <FeedMessage icon="offline" title="You're offline" body="Comments will load when you are back online." />
      ) : (
        <FeedMessage icon="error" title="Couldn't load comments" body={error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void refresh()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  message: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
});
