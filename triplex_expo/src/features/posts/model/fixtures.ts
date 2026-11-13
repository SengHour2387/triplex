import type { Post } from './post';

/** A minimal valid `Post` for tests; override what the test cares about. */
export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    type: 'media',
    caption: null,
    createdAt: '2026-08-10T12:00:00.000Z',
    author: { id: 'u1', username: 'dara', name: null, avatarUrl: null },
    images: [],
    tripPlan: null,
    repostId: null,
    repostedPost: null,
    reactionCount: 0,
    commentCount: 0,
    repostCount: 0,
    myReaction: null,
    isReposted: false,
    ...overrides,
  };
}

/** A post exactly as `GET posts/feed` sends it (snake_case, NUMERIC and COUNT as strings). */
export function wirePost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'w1',
    type: 'trip_plan_media',
    caption: 'Sunrise',
    likes_count: 2,
    comments_count: 1,
    repost_count: 1,
    reposts_count: 1,
    repost_id: null,
    is_liked: true,
    my_reaction: 'love',
    is_reposted: false,
    created_at: '2026-08-10T12:22:11.172Z',
    updated_at: '2026-08-10T12:22:11.172Z',
    user: { id: 'u1', username: 'usertest67', email: 'private@example.test', name: null, avatar_url: 'https://img/a.jpg' },
    media: [
      { id: 'm2', cloud_url: 'https://img/2.webp', type: 'image', sort_order: 1 },
      { id: 'm1', cloud_url: 'https://img/1.webp', type: 'image', sort_order: 0 },
    ],
    media_urls: ['https://img/2.webp', 'https://img/1.webp'],
    tripPlan: {
      id: 't1',
      title: 'Kirirom',
      caption: null,
      total_cost: '1.50',
      total_cost_currency: 'USD',
      waypoints: [],
      start: null,
      end: { id: 's1', title: 'sit here', role: 'end', description: null, cost: '1.50', currency: 'USD', sort_order: 1 },
    },
    ...overrides,
  };
}
