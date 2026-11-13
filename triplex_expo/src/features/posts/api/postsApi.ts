import { apiClient } from '../../../core/api/client';
import { Endpoints } from '../../../core/api/endpoints';
import { send } from '../../../core/api/request';
import type { ReactionState } from '../model/applyReaction';
import type { Post } from '../model/post';
import type { ReactionType } from '../model/reactions';
import { feedResponseSchema, postReactionsSchema, postResponseSchema, reactResponseSchema, type PostReactions } from '../model/schemas';

export const PostsApi = {
  /** The whole feed, newest first. (The backend has no paging yet — see ADR-010.) */
  feed(): Promise<Post[]> {
    return send(apiClient, { method: 'get', url: Endpoints.posts.feed }, feedResponseSchema);
  },

  /** One post by id — the detail screen and `triplex://post/<id>`. */
  get(postId: string): Promise<Post> {
    return send(apiClient, { method: 'get', url: Endpoints.posts.getById(postId) }, postResponseSchema);
  },

  /** Repost `postId` (the original — never a repost of a repost), with an optional quote. */
  repost(postId: string, caption?: string): Promise<Post> {
    const text = caption?.trim();
    return send(apiClient, { method: 'post', url: Endpoints.posts.repost(postId), data: text ? { caption: text } : {} }, postResponseSchema);
  },

  react(postId: string, type: ReactionType): Promise<ReactionState> {
    return send(apiClient, { method: 'post', url: Endpoints.likes.react(postId), data: { type } }, reactResponseSchema);
  },

  unreact(postId: string, type: ReactionType): Promise<ReactionState> {
    return send(apiClient, { method: 'delete', url: Endpoints.likes.react(postId), data: { type } }, reactResponseSchema);
  },

  reactions(postId: string): Promise<PostReactions> {
    return send(apiClient, { method: 'get', url: Endpoints.likes.list(postId) }, postReactionsSchema);
  },
};
