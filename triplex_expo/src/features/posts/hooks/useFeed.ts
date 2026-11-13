import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { toAppError, type AppError } from '../../../core/errors/appError';
import { useAuthStore } from '../../auth/store/authStore';
import { PostsApi } from '../api/postsApi';
import { loadFeedSnapshot, saveFeedSnapshot } from '../model/feedSnapshot';
import type { Post } from '../model/post';
import { postKeys } from '../model/postCache';

export type FeedStatus = 'loading' | 'offline' | 'error' | 'empty' | 'ready';

export interface FeedState {
  posts: Post[];
  status: FeedStatus;
  /** The last fetch's failure. `posts` may still hold the previous feed. */
  error: AppError | null;
  /** True only for a pull-to-refresh the user started (not the background refresh on open). */
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * The feed (`GET posts/feed`), stale-while-revalidate:
 *  - within a session the query cache shows the last feed instantly and refetches behind it;
 *  - across launches the last feed is read back from disk (`feedSnapshot`), shown at once, and then
 *    replaced by the network's answer — unless the network won the race, which it must never lose to.
 * Offline with nothing saved is its own state, not an error.
 */
export function useFeed(): FeedState {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const query = useQuery({
    queryKey: postKeys.feed,
    queryFn: async () => {
      const posts = await PostsApi.feed();
      if (userId) void saveFeedSnapshot(userId, posts);
      return posts;
    },
  });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void loadFeedSnapshot(userId).then((snapshot) => {
      // `updatedAt: 0` marks it stale, so the fetch already running still replaces it.
      if (active && snapshot && queryClient.getQueryData(postKeys.feed) === undefined) {
        queryClient.setQueryData(postKeys.feed, snapshot, { updatedAt: 0 });
      }
    });
    return () => {
      active = false;
    };
  }, [userId, queryClient]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const posts = query.data;
  const status: FeedStatus =
    posts !== undefined
      ? posts.length === 0
        ? 'empty'
        : 'ready'
      : query.isError
        ? 'error'
        : query.fetchStatus === 'paused'
          ? 'offline'
          : 'loading';

  return { posts: posts ?? EMPTY, status, error: query.isError ? toAppError(query.error) : null, refreshing, refresh };
}

const EMPTY: Post[] = [];
