import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { PostsApi } from '../api/postsApi';
import { postKeys } from '../model/postCache';
import type { ReactionType } from '../model/reactions';
import { topReactionTypes } from '../model/reactionSummary';

/**
 * The top reactions on a post (for the emoji stack beside the count). The feed only carries a count, so
 * a card asks for the breakdown (`GET likes/:id/likes`, the same entry the reactions sheet uses) when it is
 * on screen and has reactions. It is decoration: a failure is silent and just means no stack.
 */
export function useReactionSummary(postId: string, reactionCount: number): ReactionType[] {
  const query = useQuery({
    queryKey: postKeys.reactions(postId),
    queryFn: () => PostsApi.reactions(postId),
    enabled: reactionCount > 0,
    staleTime: 60_000,
    meta: { silent: true },
  });
  return useMemo(() => topReactionTypes(query.data?.reactions ?? []), [query.data]);
}
