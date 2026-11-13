import { apiClient } from '../../../core/api/client';
import { Endpoints } from '../../../core/api/endpoints';
import { send } from '../../../core/api/request';
import type { ReactionState, ReactionType } from '../../posts';
import type { Comment } from '../model/comment';
import { commentDeletedSchema, commentListResponseSchema, commentReactResponseSchema, commentResponseSchema } from '../model/schemas';

export const CommentsApi = {
  /** Top-level comments of a post, oldest first. Replies are fetched per comment. */
  list(postId: string): Promise<Comment[]> {
    return send(apiClient, { method: 'get', url: Endpoints.comments.list(postId) }, commentListResponseSchema);
  },

  /** Replies under a top-level comment, oldest first. */
  replies(commentId: string): Promise<Comment[]> {
    return send(apiClient, { method: 'get', url: Endpoints.comments.replies(commentId) }, commentListResponseSchema);
  },

  add(postId: string, content: string): Promise<Comment> {
    return send(apiClient, { method: 'post', url: Endpoints.comments.create(postId), data: { content: content.trim(), parentCommentId: null } }, commentResponseSchema);
  },

  /** `parentId` must be a top-level comment (the server refuses a reply to a reply). */
  reply(parentId: string, content: string): Promise<Comment> {
    return send(apiClient, { method: 'post', url: Endpoints.comments.replies(parentId), data: { content: content.trim() } }, commentResponseSchema);
  },

  react(commentId: string, type: ReactionType): Promise<ReactionState> {
    return send(apiClient, { method: 'post', url: Endpoints.comments.react(commentId), data: { type } }, commentReactResponseSchema);
  },

  unreact(commentId: string, type: ReactionType): Promise<ReactionState> {
    return send(apiClient, { method: 'delete', url: Endpoints.comments.react(commentId), data: { type } }, commentReactResponseSchema);
  },

  /** Soft delete — the row stays (so its replies do) but its text and author are hidden. */
  async remove(commentId: string): Promise<void> {
    await send(apiClient, { method: 'delete', url: Endpoints.comments.delete(commentId) }, commentDeletedSchema);
  },
};
