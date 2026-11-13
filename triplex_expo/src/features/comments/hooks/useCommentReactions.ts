import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { toAppError } from '../../../core/errors/appError';
import { notifyError } from '../../../core/notify';
import { nextReactionForPick, nextReactionForTap, ReactionSync, type ReactionType } from '../../posts';
import { CommentsApi } from '../api/commentsApi';
import type { Comment } from '../model/comment';
import { findComment, patchComment } from '../model/commentCache';

const syncs = new WeakMap<QueryClient, ReactionSync<Comment>>();

/** One `ReactionSync` per query client: the same optimistic, coalescing machinery posts use (ADR-010). */
function syncFor(queryClient: QueryClient): ReactionSync<Comment> {
  let sync = syncs.get(queryClient);
  if (!sync) {
    sync = new ReactionSync<Comment>({
      server: CommentsApi,
      getPost: (id) => findComment(queryClient, id),
      patch: (id, update) => patchComment(queryClient, id, update),
      onFailure: (error, failed) =>
        notifyError(toAppError(error), {
          action: { what: 'save your reaction', outcome: 'Your reaction was taken back.' },
          retry: () => void sync?.set(failed.id, failed.desired),
        }),
    });
    syncs.set(queryClient, sync);
  }
  return sync;
}

export interface CommentReactionActions {
  /** The like button: react with a Like, or take your reaction back. */
  tap: (comment: Comment) => void;
  /** Choose a specific reaction (the picker, or a screen reader's custom action). */
  pick: (comment: Comment, type: ReactionType) => void;
}

/** Optimistic reactions on comments: the row changes at once, the server catches up (reverting on failure). */
export function useCommentReactions(): CommentReactionActions {
  const queryClient = useQueryClient();
  const sync = useMemo(() => syncFor(queryClient), [queryClient]);

  const tap = useCallback(
    (comment: Comment) => {
      const current = findComment(queryClient, comment.id) ?? comment;
      void sync.set(comment.id, nextReactionForTap(current.myReaction));
    },
    [queryClient, sync],
  );
  const pick = useCallback(
    (comment: Comment, type: ReactionType) => {
      const current = findComment(queryClient, comment.id) ?? comment;
      void sync.set(comment.id, nextReactionForPick(current.myReaction, type));
    },
    [queryClient, sync],
  );
  return { tap, pick };
}
