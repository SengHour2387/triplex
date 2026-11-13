import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { notifyError } from '../../../core/notify';
import { toAppError } from '../../../core/errors/appError';
import { PostsApi } from '../api/postsApi';
import { nextReactionForPick, nextReactionForTap } from '../model/applyReaction';
import type { Post } from '../model/post';
import { findPost, patchPost, postKeys } from '../model/postCache';
import type { ReactionType } from '../model/reactions';
import { ReactionSync } from '../model/reactionSync';

const syncs = new WeakMap<QueryClient, ReactionSync<Post>>();

/** One `ReactionSync` per query client, so every card talking about a post goes through the same queue. */
function syncFor(queryClient: QueryClient): ReactionSync<Post> {
  let sync = syncs.get(queryClient);
  if (!sync) {
    sync = new ReactionSync<Post>({
      server: PostsApi,
      getPost: (id) => findPost(queryClient, id),
      patch: (id, update) => patchPost(queryClient, id, update),
      onFailure: (error, failed) =>
        notifyError(toAppError(error), {
          action: { what: 'save your reaction', outcome: 'Your reaction was taken back.' },
          retry: () => void sync?.set(failed.id, failed.desired),
        }),
      // Who reacted has changed: the stack of top reactions on the card and the reactions sheet refetch.
      onConverged: (id) => void queryClient.invalidateQueries({ queryKey: postKeys.reactions(id) }),
    });
    syncs.set(queryClient, sync);
  }
  return sync;
}

export interface PostReactionActions {
  /** The like button: react with a Like, or take your reaction back. */
  tap: (post: Post) => void;
  /** Choose a specific reaction (the picker, or a screen reader's custom action). */
  pick: (post: Post, type: ReactionType) => void;
}

/** Optimistic reactions: the card changes at once; the server catches up (see `ReactionSync`). */
export function useReactions(): PostReactionActions {
  const queryClient = useQueryClient();
  const sync = useMemo(() => syncFor(queryClient), [queryClient]);

  // Read the *cache's* copy, not the (possibly one render old) prop: two quick taps must see each other.
  const tap = useCallback(
    (post: Post) => {
      const current = findPost(queryClient, post.id) ?? post;
      void sync.set(post.id, nextReactionForTap(current.myReaction));
    },
    [queryClient, sync],
  );
  const pick = useCallback(
    (post: Post, type: ReactionType) => {
      const current = findPost(queryClient, post.id) ?? post;
      void sync.set(post.id, nextReactionForPick(current.myReaction, type));
    },
    [queryClient, sync],
  );

  return { tap, pick };
}
