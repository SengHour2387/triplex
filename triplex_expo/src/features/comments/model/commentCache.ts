import type { QueryClient } from '@tanstack/react-query';

import type { Comment } from './comment';

/**
 * Where comments live in the query cache: a post's top-level comments, and a comment's replies (loaded
 * when the thread is opened). As with posts, every change goes through these helpers, so the sheet and
 * the detail screen — which read the same entries — can never disagree.
 */
export const commentKeys = {
  all: ['comments'] as const,
  list: (postId: string) => ['comments', 'post', postId] as const,
  replies: (commentId: string) => ['comments', 'replies', commentId] as const,
};

/** Rewrite one comment wherever it is cached (a top-level list or a replies list). Untouched ones keep their identity. */
export function patchComment(queryClient: QueryClient, commentId: string, update: (comment: Comment) => Comment): void {
  queryClient.setQueriesData<Comment[]>({ queryKey: commentKeys.all }, (list) => {
    if (!Array.isArray(list)) return list;
    const next = list.map((comment) => (comment.id === commentId ? update(comment) : comment));
    return next.some((comment, i) => comment !== list[i]) ? next : list;
  });
}

/** The freshest cached copy of a comment. */
export function findComment(queryClient: QueryClient, commentId: string): Comment | undefined {
  for (const [, list] of queryClient.getQueriesData<Comment[]>({ queryKey: commentKeys.all })) {
    const found = Array.isArray(list) ? list.find((comment) => comment.id === commentId) : undefined;
    if (found) return found;
  }
  return undefined;
}

/** Add a comment at the end of its list (oldest first), and — for a reply — count it under its parent. */
export function appendComment(queryClient: QueryClient, comment: Comment): void {
  const key = comment.parentId === null ? commentKeys.list(comment.postId) : commentKeys.replies(comment.parentId);
  queryClient.setQueryData<Comment[]>(key, (list) => (list ? [...list.filter((c) => c.id !== comment.id), comment] : list));
  if (comment.parentId !== null) patchComment(queryClient, comment.parentId, (parent) => ({ ...parent, replyCount: parent.replyCount + 1 }));
}

/** Take a comment out of its list again (an add that failed), and un-count it from its parent. */
export function removeComment(queryClient: QueryClient, comment: Comment): void {
  const key = comment.parentId === null ? commentKeys.list(comment.postId) : commentKeys.replies(comment.parentId);
  queryClient.setQueryData<Comment[]>(key, (list) => list?.filter((c) => c.id !== comment.id));
  if (comment.parentId !== null) patchComment(queryClient, comment.parentId, (parent) => ({ ...parent, replyCount: Math.max(0, parent.replyCount - 1) }));
}

/** The server's copy replaces the placeholder (same place in the list). */
export function confirmComment(queryClient: QueryClient, tempId: string, saved: Comment): void {
  patchComment(queryClient, tempId, () => saved);
}

/** What a deleted comment looks like: the text and author are gone, the row (and its replies) stay. */
export const asDeleted = (comment: Comment): Comment => ({ ...comment, isDeleted: true, content: '', author: null, myReaction: null, reactionCount: 0 });
