import { useQuery } from '@tanstack/react-query';

import { toAppError, type AppError } from '../../../core/errors/appError';
import { PostsApi } from '../api/postsApi';
import { postKeys } from '../model/postCache';
import type { PostReactions } from '../model/schemas';

export interface PostReactionsState {
  data: PostReactions | undefined;
  isLoading: boolean;
  isOffline: boolean;
  error: AppError | null;
  retry: () => void;
}

/** Who reacted, and with what (`GET likes/:postId/likes`) — the reactions sheet. */
export function usePostReactions(postId: string): PostReactionsState {
  const query = useQuery({ queryKey: postKeys.reactions(postId), queryFn: () => PostsApi.reactions(postId), staleTime: 0 });
  return {
    data: query.data,
    isLoading: query.data === undefined && query.fetchStatus === 'fetching',
    isOffline: query.data === undefined && query.fetchStatus === 'paused',
    error: query.isError ? toAppError(query.error) : null,
    retry: () => void query.refetch(),
  };
}
