import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { toAppError, type AppError } from '../../../core/errors/appError';
import { CommentsApi } from '../api/commentsApi';
import type { Comment } from '../model/comment';
import { commentKeys } from '../model/commentCache';

export interface CommentsState {
  comments: Comment[] | undefined;
  /** First load with nothing to show. */
  isLoading: boolean;
  /** Nothing to show and the request is waiting for the network. */
  isOffline: boolean;
  /** The list is on screen but being fetched again (pull to refresh). */
  isRefreshing: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
}

/** A post's top-level comments, oldest first (`GET comments/:postId/comments`). */
export function useComments(postId: string): CommentsState {
  const query = useQuery({ queryKey: commentKeys.list(postId), queryFn: () => CommentsApi.list(postId), enabled: postId !== '' });
  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);
  return {
    comments: query.data,
    isLoading: query.data === undefined && query.fetchStatus === 'fetching',
    isOffline: query.data === undefined && query.fetchStatus === 'paused',
    isRefreshing: query.data !== undefined && query.isRefetching,
    error: query.isError && query.data === undefined ? toAppError(query.error) : null,
    refresh,
  };
}

export interface RepliesState {
  replies: Comment[] | undefined;
  isLoading: boolean;
  isOffline: boolean;
  error: AppError | null;
  retry: () => void;
}

/** The replies under one comment, loaded only once its thread is opened (`GET comments/:id/replies`). */
export function useReplies(commentId: string, open: boolean): RepliesState {
  const query = useQuery({ queryKey: commentKeys.replies(commentId), queryFn: () => CommentsApi.replies(commentId), enabled: open });
  return {
    replies: query.data,
    isLoading: query.data === undefined && query.fetchStatus === 'fetching',
    isOffline: query.data === undefined && query.fetchStatus === 'paused',
    error: query.isError && query.data === undefined ? toAppError(query.error) : null,
    retry: () => void query.refetch(),
  };
}
