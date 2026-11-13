import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { toAppError } from '../../../core/errors/appError';
import { notifyError } from '../../../core/notify';
import { adjustCommentCount, type PostAuthor } from '../../posts';
import { CommentsApi } from '../api/commentsApi';
import { pendingComment, threadRoot, type Comment } from '../model/comment';
import { appendComment, asDeleted, commentKeys, confirmComment, findComment, patchComment, removeComment } from '../model/commentCache';

export interface NewComment {
  postId: string;
  /** The comment being replied to. A reply to a reply attaches to the top-level comment (`threadRoot`). */
  replyTo: Pick<Comment, 'id' | 'parentId'> | null;
  content: string;
  /** Who is writing — the placeholder shows them at once. */
  author: PostAuthor;
}

/** Make sure the list a reply goes into exists, so the placeholder has somewhere to be (and older replies aren't hidden by it). */
async function ensureReplies(queryClient: QueryClient, parentId: string): Promise<void> {
  const key = commentKeys.replies(parentId);
  if (queryClient.getQueryData(key)) return;
  if ((findComment(queryClient, parentId)?.replyCount ?? 0) === 0) {
    queryClient.setQueryData<Comment[]>(key, []);
    return;
  }
  await queryClient.fetchQuery({ queryKey: key, queryFn: () => CommentsApi.replies(parentId), staleTime: Infinity });
}

/**
 * Add a comment or a reply. The placeholder appears at once (and the post's comment count goes up
 * everywhere); the server's copy replaces it. If the server refuses, both are taken back and the failure
 * is toasted, saying the text is still in the box — the caller gets `false` and puts it back (the send
 * button is the retry, so the toast has none).
 */
export function useAddComment(): (comment: NewComment) => Promise<boolean> {
  const queryClient = useQueryClient();
  const counter = useRef(0);

  const mutation = useMutation({
    meta: { silent: true },
    mutationFn: ({ comment, parentId }: { comment: NewComment; parentId: string | null }) =>
      parentId === null ? CommentsApi.add(comment.postId, comment.content) : CommentsApi.reply(parentId, comment.content),
    onMutate: async ({ comment, parentId }) => {
      if (parentId !== null) await ensureReplies(queryClient, parentId);
      counter.current += 1;
      const placeholder = pendingComment({ tempId: `pending-${Date.now()}-${counter.current}`, postId: comment.postId, parentId, content: comment.content.trim(), author: comment.author });
      appendComment(queryClient, placeholder);
      // The server's `comments_count` counts top-level comments only (a reply doesn't move it — seen on a device).
      if (parentId === null) adjustCommentCount(queryClient, comment.postId, 1);
      return { placeholder };
    },
    onSuccess: (saved, _vars, context) => confirmComment(queryClient, context.placeholder.id, saved),
    onError: (error, { comment, parentId }, context) => {
      notifyError(toAppError(error), { action: { what: 'post your comment', outcome: 'Your text is still in the box.' } });
      if (!context) return; // failed before anything was shown (loading the replies)
      removeComment(queryClient, context.placeholder);
      if (parentId === null) adjustCommentCount(queryClient, comment.postId, -1);
    },
  });

  return useCallback(
    async (comment: NewComment) => {
      try {
        await mutation.mutateAsync({ comment, parentId: comment.replyTo ? threadRoot(comment.replyTo) : null });
        return true;
      } catch {
        return false;
      }
    },
    [mutation],
  );
}

/**
 * Delete one of your own comments (soft delete). It reads "This comment was deleted." at once; if the
 * server refuses (not yours, already gone, offline) it comes back and the reason is toasted, with a Retry
 * when trying again could help. Either way
 * the list is refetched afterwards if it failed, so what is shown is what the server holds.
 */
export function useDeleteComment(): (comment: Comment) => void {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    meta: { silent: true },
    mutationFn: (comment: Comment) => CommentsApi.remove(comment.id),
    onMutate: (comment) => {
      const before = findComment(queryClient, comment.id) ?? comment;
      patchComment(queryClient, comment.id, asDeleted);
      // The post's comment count does not change: the server keeps counting a deleted comment (its row stays, as
      // "This comment was deleted.") — seen on a device. So there is no count to roll back either.
      return { before };
    },
    onError: (error, comment, context) => {
      notifyError(toAppError(error), {
        action: { what: 'delete your comment', outcome: 'The comment is still there.' },
        retry: () => mutation.mutate(comment),
      });
      if (context) patchComment(queryClient, comment.id, () => context.before);
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
  return useCallback((comment: Comment) => mutation.mutate(comment), [mutation]);
}
