import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toAppError } from '../../../core/errors/appError';
import { notifyError } from '../../../core/notify';
import { toast } from '../../../design-system';
import { PostsApi } from '../api/postsApi';
import { patchPost, prependToFeed } from '../model/postCache';

/**
 * Repost `originalId` with an optional quote. On success the new post goes to the top of the feed and
 * the original's repost count and "reposted" mark update wherever it is cached. A failure is toasted
 * (saying the note is kept); the sheet stays open and "Repost now" is the retry, so the toast has none.
 */
export function useRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { silent: true },
    mutationFn: ({ originalId, caption }: { originalId: string; caption?: string }) => PostsApi.repost(originalId, caption),
    onError: (error) => notifyError(toAppError(error), { action: { what: 'repost', outcome: 'Your note is still here.' } }),
    onSuccess: (repost, { originalId }) => {
      prependToFeed(queryClient, repost);
      patchPost(queryClient, originalId, (p) => ({ ...p, repostCount: p.repostCount + 1, isReposted: true }));
      toast.success('Reposted');
    },
  });
}
