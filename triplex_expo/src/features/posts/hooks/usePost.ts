import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { toAppError, type AppError } from '../../../core/errors/appError';
import { PostsApi } from '../api/postsApi';
import type { Post } from '../model/post';
import { findPost, postKeys } from '../model/postCache';

export interface PostState {
  post: Post | undefined;
  /** First load with nothing to show. */
  isLoading: boolean;
  /** Nothing to show and the request is waiting for the network. */
  isOffline: boolean;
  /** The post doesn't exist (any more). */
  isGone: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
}

/**
 * One post by id (`GET posts/:id`) — the detail screen and `triplex://post/<id>`.
 *
 * Opened from the feed, the card the user just saw is used as the starting point (marked stale), so
 * the screen is never blank — and then the server's copy replaces it. Flutter passed the card through
 * `extra` and never refreshed it; deep links had nothing to show.
 */
export function usePost(postId: string): PostState {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => PostsApi.get(postId),
    initialData: () => findPost(queryClient, postId),
    initialDataUpdatedAt: 0,
    enabled: postId !== '',
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const error = query.isError ? toAppError(query.error) : null;
  return {
    post: query.data,
    isLoading: query.data === undefined && query.fetchStatus === 'fetching',
    isOffline: query.data === undefined && query.fetchStatus === 'paused',
    isGone: error?.kind === 'not_found',
    error,
    refresh,
  };
}
