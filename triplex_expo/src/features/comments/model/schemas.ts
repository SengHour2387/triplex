import { z } from 'zod';

// Straight from posts' model files, not its index: the index loads the post screen, which loads comments —
// a module-level `countSchema` read through that cycle is still undefined (found on device).
import { toReactionType } from '../../posts/model/reactions';
import { authorSchema, count as countSchema } from '../../posts/model/schemas';
import type { Comment } from './comment';

/**
 * Wire format (`triplex_node/controllers/commentController.js`) → the app's `Comment`.
 *
 * A deleted comment comes back with `content: null` and `user: null` (the backend hides both), so
 * neither is required. A comment with no id / post, or a live one with no author, is structurally wrong
 * and fails — better a visible error than a row full of `undefined`.
 */
const wireComment = z.object({
  id: z.string(),
  post_id: z.string(),
  parent_comment_id: z.string().nullish(),
  content: z.string().nullish(),
  is_deleted: z.boolean().nullish(),
  likes_count: countSchema.optional(),
  replies_count: countSchema.optional(),
  is_reacted: z.boolean().nullish(),
  my_reaction: z.string().nullish(),
  created_at: z.string(),
  user: authorSchema.nullish(),
});

export const commentSchema = wireComment.transform((wire, ctx): Comment => {
  const isDeleted = wire.is_deleted === true;
  if (!isDeleted && !wire.user) {
    ctx.addIssue({ code: 'custom', message: 'a live comment has no author' });
    return z.NEVER;
  }
  return {
    id: wire.id,
    postId: wire.post_id,
    parentId: wire.parent_comment_id ?? null,
    content: isDeleted ? '' : (wire.content ?? ''),
    isDeleted,
    author: isDeleted ? null : (wire.user ?? null),
    createdAt: wire.created_at,
    reactionCount: wire.likes_count ?? 0,
    // `is_reacted` and `my_reaction` come from the same JOIN; trust the reaction, but honour an explicit `false`.
    myReaction: wire.is_reacted === false ? null : toReactionType(wire.my_reaction),
    replyCount: wire.replies_count ?? 0,
    pending: false,
  };
});

/** `{ status, data: Comment[] }` — `GET comments/:postId/comments`, `GET comments/:id/replies`. */
export const commentListResponseSchema = z.object({ data: z.array(commentSchema) }).transform((r) => r.data);

/** `{ status, data: Comment }` — `POST comments/:postId/comments`, `POST comments/:id/replies`. */
export const commentResponseSchema = z.object({ data: commentSchema }).transform((r) => r.data);

/**
 * `POST` / `DELETE comments/:id/like`. Unlike a post's, the answer carries the per-type counts, not a
 * total — the comment's count is their sum. `my_reaction` is only on the POST; the DELETE lists `my_reactions`.
 */
export const commentReactResponseSchema = z
  .object({
    reactions: z.array(z.object({ type: z.string(), count: countSchema })).nullish(),
    my_reaction: z.string().nullish(),
    my_reactions: z.array(z.string()).nullish(),
  })
  .transform((r) => ({
    reactionCount: (r.reactions ?? []).reduce((sum, item) => sum + item.count, 0),
    myReaction: toReactionType(r.my_reaction ?? r.my_reactions?.[0] ?? null),
  }));

/** `DELETE comments/comment/:id` — nothing to read but that it succeeded. */
export const commentDeletedSchema = z.object({}).passthrough();
