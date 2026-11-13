import type { QueryClient } from '@tanstack/react-query';

import type { Post } from './post';

/**
 * Where posts live in the query cache. A post can be in the feed list, in its own detail entry, and
 * embedded in a repost — and it is the *cache* that holds the one truth: every change goes through
 * `patchPost`, which rewrites all of those copies, so a reaction on the feed shows on the detail
 * screen (and vice versa) without either knowing about the other.
 */
export const postKeys = {
  all: ['posts'] as const,
  feed: ['posts', 'feed'] as const,
  details: ['posts', 'detail'] as const,
  detail: (postId: string) => ['posts', 'detail', postId] as const,
  reactions: (postId: string) => ['posts', 'reactions', postId] as const,
};

/** `update` applied to `post` and to a copy of it embedded in a repost; other posts are returned as they were. */
function applyTo(post: Post, postId: string, update: (p: Post) => Post): Post {
  if (post.id === postId) {
    const next = update(post);
    return next === post ? post : next;
  }
  const embedded = post.repostedPost;
  if (embedded?.id === postId) {
    const next = update(embedded);
    return next === embedded ? post : { ...post, repostedPost: next };
  }
  return post;
}

/** Rewrite every cached copy of a post. Posts that don't change keep their identity (so lists don't re-render). */
export function patchPost(queryClient: QueryClient, postId: string, update: (post: Post) => Post): void {
  queryClient.setQueriesData<Post[]>({ queryKey: postKeys.feed }, (list) => {
    if (!list) return list;
    const next = list.map((post) => applyTo(post, postId, update));
    return next.some((post, i) => post !== list[i]) ? next : list;
  });
  queryClient.setQueriesData<Post>({ queryKey: postKeys.details }, (post) => (post ? applyTo(post, postId, update) : post));
}

/** The freshest cached copy of a post (feed or detail), if any screen has loaded it. */
export function findPost(queryClient: QueryClient, postId: string): Post | undefined {
  for (const [, post] of queryClient.getQueriesData<Post>({ queryKey: postKeys.details })) {
    if (post?.id === postId) return post;
    if (post?.repostedPost?.id === postId) return post.repostedPost;
  }
  for (const [, list] of queryClient.getQueriesData<Post[]>({ queryKey: postKeys.feed })) {
    for (const post of list ?? []) {
      if (post.id === postId) return post;
      if (post.repostedPost?.id === postId) return post.repostedPost;
    }
  }
  return undefined;
}

/** A new post (a repost the user just made) goes to the top of the feed. */
export function prependToFeed(queryClient: QueryClient, post: Post): void {
  queryClient.setQueriesData<Post[]>({ queryKey: postKeys.feed }, (list) => (list ? [post, ...list.filter((p) => p.id !== post.id)] : list));
}

/** The comment count changed (a comment was added, or taken back): every cached copy of the post follows. */
export function adjustCommentCount(queryClient: QueryClient, postId: string, delta: number): void {
  patchPost(queryClient, postId, (post) => {
    const next = Math.max(0, post.commentCount + delta);
    return next === post.commentCount ? post : { ...post, commentCount: next };
  });
}
