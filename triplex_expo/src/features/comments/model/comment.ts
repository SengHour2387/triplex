import type { PostAuthor, ReactionState, ReactionType } from '../../posts';

/**
 * A comment as the app uses it (the wire format is parsed in `schemas.ts`). `myReaction` and
 * `reactionCount` are named like a post's so the same optimistic-reaction machinery serves both.
 */
export interface Comment extends ReactionState {
  id: string;
  postId: string;
  /** The top-level comment this replies to; `null` for a top-level comment. Replies are one level deep. */
  parentId: string | null;
  /** Empty when the comment was deleted — show `DELETED_TEXT`. */
  content: string;
  isDeleted: boolean;
  /** `null` once deleted: the server drops the author along with the text. */
  author: PostAuthor | null;
  /** ISO 8601. */
  createdAt: string;
  /** Replies under a top-level comment (always 0 on a reply). */
  replyCount: number;
  /** Added here, not yet confirmed by the server: it can't be reacted to, replied to or deleted until it is. */
  pending: boolean;
  myReaction: ReactionType | null;
}

export const DELETED_TEXT = 'This comment was deleted.';

/** A reply to a reply attaches to the top-level comment: replies are one level deep (plan §Task 8). */
export const threadRoot = (comment: Pick<Comment, 'id' | 'parentId'>): string => comment.parentId ?? comment.id;

/** A placeholder shown at once while the server saves a new comment. */
export function pendingComment(input: { tempId: string; postId: string; parentId: string | null; content: string; author: PostAuthor; now?: Date }): Comment {
  return {
    id: input.tempId,
    postId: input.postId,
    parentId: input.parentId,
    content: input.content,
    isDeleted: false,
    author: input.author,
    createdAt: (input.now ?? new Date()).toISOString(),
    reactionCount: 0,
    myReaction: null,
    replyCount: 0,
    pending: true,
  };
}
