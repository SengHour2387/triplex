import { wireComment } from './fixtures';
import { commentListResponseSchema, commentReactResponseSchema, commentResponseSchema } from './schemas';

describe('comment wire format', () => {
  it('turns a comment into the app model (counts arrive as strings, snake_case becomes camelCase)', () => {
    const [comment] = commentListResponseSchema.parse({ status: 'success', data: [wireComment()] });
    expect(comment).toEqual({
      id: 'w1',
      postId: 'p1',
      parentId: null,
      content: 'Awesome trip plan!',
      isDeleted: false,
      author: { id: 'u1', username: 'johndoe', name: 'John Doe', avatarUrl: 'https://img/a.jpg' },
      createdAt: '2026-08-01T15:00:00.000Z',
      reactionCount: 12,
      myReaction: 'love',
      replyCount: 3,
      pending: false,
    });
  });

  it('reads a deleted comment: the server sends no text and no author', () => {
    const [comment] = commentListResponseSchema.parse({ data: [wireComment({ is_deleted: true, content: null, user: null, is_reacted: false, my_reaction: null })] });
    expect(comment).toMatchObject({ isDeleted: true, content: '', author: null, myReaction: null });
  });

  it('a live comment with no author is a bad response, not a row with a missing name', () => {
    expect(commentListResponseSchema.safeParse({ data: [wireComment({ user: null })] }).success).toBe(false);
    expect(commentListResponseSchema.safeParse({ data: [{ id: 'x' }] }).success).toBe(false);
  });

  it('a reply knows its parent; an explicit is_reacted:false beats a stale my_reaction', () => {
    const { parentId, myReaction } = commentResponseSchema.parse({ data: wireComment({ parent_comment_id: 'top', is_reacted: false, my_reaction: 'like' }) });
    expect(parentId).toBe('top');
    expect(myReaction).toBeNull();
  });

  it('an unknown reaction type is shown as a Like instead of failing the list', () => {
    expect(commentResponseSchema.parse({ data: wireComment({ my_reaction: 'hug' }) }).myReaction).toBe('like');
  });

  it('a reaction answer carries per-type counts — the comment count is their sum', () => {
    const reacted = commentReactResponseSchema.parse({ reactions: [{ type: 'like', count: '5' }, { type: 'love', count: '2' }], my_reaction: 'love', my_reactions: ['love'] });
    expect(reacted).toEqual({ reactionCount: 7, myReaction: 'love' });
    // The DELETE answer has no `my_reaction`, only `my_reactions`.
    expect(commentReactResponseSchema.parse({ reactions: [], my_reactions: [] })).toEqual({ reactionCount: 0, myReaction: null });
    expect(commentReactResponseSchema.parse({ reactions: [{ type: 'like', count: '1' }], my_reactions: ['like'] })).toEqual({ reactionCount: 1, myReaction: 'like' });
  });
});
