import type { Comment } from './comment';

/** A minimal valid `Comment` for tests; override what the test cares about. */
export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    postId: 'p1',
    parentId: null,
    content: 'Nice route!',
    isDeleted: false,
    author: { id: 'u1', username: 'dara', name: null, avatarUrl: null },
    createdAt: '2026-08-10T12:00:00.000Z',
    reactionCount: 0,
    myReaction: null,
    replyCount: 0,
    pending: false,
    ...overrides,
  };
}

/** A comment exactly as the API sends it. */
export function wireComment(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'w1',
    post_id: 'p1',
    parent_comment_id: null,
    content: 'Awesome trip plan!',
    is_deleted: false,
    likes_count: '12', // COUNT(*) arrives as a string
    replies_count: 3,
    is_reacted: true,
    my_reaction: 'love',
    created_at: '2026-08-01T15:00:00.000Z',
    updated_at: '2026-08-01T15:00:00.000Z',
    user: { id: 'u1', username: 'johndoe', name: 'John Doe', avatar_url: 'https://img/a.jpg' },
    ...overrides,
  };
}
