import { wirePost } from './fixtures';
import { feedResponseSchema, feedSnapshotSchema, postReactionsSchema, postResponseSchema, reactResponseSchema } from './schemas';

describe('post schema', () => {
  it('maps the backend payload to the app model', () => {
    const [post] = feedResponseSchema.parse({ status: 'success', data: [wirePost()] });
    expect(post).toMatchObject({
      id: 'w1',
      type: 'trip_plan_media',
      caption: 'Sunrise',
      author: { username: 'usertest67', avatarUrl: 'https://img/a.jpg', name: null },
      reactionCount: 2,
      commentCount: 1,
      repostCount: 1,
      myReaction: 'love',
      isReposted: false,
    });
  });

  it('orders photos by sort_order, not by array order', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost()] });
    expect(post.images).toEqual(['https://img/1.webp', 'https://img/2.webp']);
  });

  it('falls back to media_urls when media is absent', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost({ media: undefined, media_urls: ['https://img/x.jpg'] })] });
    expect(post.images).toEqual(['https://img/x.jpg']);
  });

  it("never carries the author's email into the app model", () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost()] });
    expect(JSON.stringify(post)).not.toContain('private@example.test');
  });

  it('reads pg NUMERIC strings as numbers', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost()] });
    expect(post.tripPlan).toMatchObject({ title: 'Kirirom', totalCost: 1.5, currency: 'USD' });
    expect(post.tripPlan?.end).toMatchObject({ title: 'sit here', cost: 1.5, currency: 'USD' });
    expect(post.tripPlan?.start).toBeNull();
    expect(post.tripPlan?.waypoints).toEqual([]);
  });

  it('treats a malformed number as missing instead of failing the feed', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost({ likes_count: 'many', tripPlan: { id: 't', title: 'T', total_cost: 'x', waypoints: [] } })] });
    expect(post.reactionCount).toBe(0);
    expect(post.tripPlan?.totalCost).toBeNull();
  });

  it('is not liked when is_liked is false, whatever my_reaction says', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost({ is_liked: false, my_reaction: 'love' })] });
    expect(post.myReaction).toBeNull();
  });

  it('shows a reaction type this app does not know as a Like', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost({ my_reaction: 'fire' })] });
    expect(post.myReaction).toBe('like');
  });

  it('nests the original of a repost, and tolerates it being gone', () => {
    const repost = wirePost({ id: 'r1', type: 'repost', repost_id: 'w1', media: [], media_urls: [], tripPlan: undefined, reposted_post: wirePost() });
    const orphan = wirePost({ id: 'r2', type: 'repost', repost_id: 'gone', media: [], media_urls: [], tripPlan: undefined, reposted_post: null });
    const [a, b] = feedResponseSchema.parse({ data: [repost, orphan] });
    expect(a.repostedPost?.id).toBe('w1');
    expect(a.repostedPost?.repostedPost).toBeNull();
    expect(b.repostId).toBe('gone');
    expect(b.repostedPost).toBeNull();
  });

  it('rejects a post with no author (a visible error beats a card of undefined)', () => {
    const bad = wirePost();
    delete bad.user;
    expect(feedResponseSchema.safeParse({ data: [bad] }).success).toBe(false);
  });

  it('parses a single post response', () => {
    expect(postResponseSchema.parse({ status: 'success', data: wirePost() }).id).toBe('w1');
  });
});

describe('reaction schemas', () => {
  it('reads the server state after reacting', () => {
    expect(reactResponseSchema.parse({ likes_count: 43, is_liked: true, my_reaction: 'love', reactions: [] })).toEqual({ reactionCount: 43, myReaction: 'love' });
    expect(reactResponseSchema.parse({ likes_count: 42, is_liked: false, my_reaction: null })).toEqual({ reactionCount: 42, myReaction: null });
  });

  it('sums the per-type counts for the total (the server total is capped at 50)', () => {
    const parsed = postReactionsSchema.parse({
      total: 50,
      reactions: [{ type: 'like', count: '42' }, { type: 'love', count: '30' }],
      users: [{ type: 'like', user_id: 'u1', username: 'dara', name: null, avatar_url: null }],
    });
    expect(parsed.total).toBe(72);
    expect(parsed.reactions).toEqual([{ type: 'like', count: 42 }, { type: 'love', count: 30 }]);
    expect(parsed.users[0]).toMatchObject({ type: 'like', userId: 'u1', username: 'dara' });
  });
});

describe('feed snapshot schema', () => {
  it('accepts posts in the app shape and rejects the wire shape', () => {
    const [post] = feedResponseSchema.parse({ data: [wirePost()] });
    expect(feedSnapshotSchema.safeParse([post]).success).toBe(true);
    expect(feedSnapshotSchema.safeParse([wirePost()]).success).toBe(false);
  });
});
