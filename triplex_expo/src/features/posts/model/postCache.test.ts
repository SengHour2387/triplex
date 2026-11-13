import { QueryClient } from '@tanstack/react-query';

import { makePost } from './fixtures';
import { findPost, patchPost, postKeys, prependToFeed } from './postCache';

function clientWith(feed: ReturnType<typeof makePost>[], detail?: ReturnType<typeof makePost>) {
  const client = new QueryClient();
  client.setQueryData(postKeys.feed, feed);
  if (detail) client.setQueryData(postKeys.detail(detail.id), detail);
  return client;
}

describe('patchPost', () => {
  it('changes the feed copy and the detail copy together (one source of truth)', () => {
    const post = makePost({ id: 'a', reactionCount: 1 });
    const client = clientWith([post, makePost({ id: 'b' })], post);
    patchPost(client, 'a', (p) => ({ ...p, myReaction: 'love', reactionCount: 2 }));
    expect(client.getQueryData<(typeof post)[]>(postKeys.feed)?.[0]).toMatchObject({ myReaction: 'love', reactionCount: 2 });
    expect(client.getQueryData<typeof post>(postKeys.detail('a'))).toMatchObject({ myReaction: 'love', reactionCount: 2 });
  });

  it('also changes the copy embedded in a repost', () => {
    const original = makePost({ id: 'orig', reactionCount: 5 });
    const repost = makePost({ id: 'rp', repostId: 'orig', repostedPost: original });
    const client = clientWith([repost]);
    patchPost(client, 'orig', (p) => ({ ...p, reactionCount: 6 }));
    expect(client.getQueryData<(typeof repost)[]>(postKeys.feed)?.[0].repostedPost?.reactionCount).toBe(6);
  });

  it('leaves untouched posts as the same objects, so the list does not re-render them', () => {
    const a = makePost({ id: 'a' });
    const b = makePost({ id: 'b' });
    const client = clientWith([a, b]);
    patchPost(client, 'a', (p) => ({ ...p, commentCount: 9 }));
    const [, nextB] = client.getQueryData<(typeof a)[]>(postKeys.feed) ?? [];
    expect(nextB).toBe(b);
  });

  it('does nothing (and does not create entries) when the post is not cached', () => {
    const client = new QueryClient();
    patchPost(client, 'x', (p) => p);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
});

describe('findPost', () => {
  it('finds a post in the feed, in a detail entry, or embedded in a repost', () => {
    const original = makePost({ id: 'orig' });
    const client = clientWith([makePost({ id: 'a' }), makePost({ id: 'rp', repostId: 'orig', repostedPost: original })], makePost({ id: 'd' }));
    expect(findPost(client, 'a')?.id).toBe('a');
    expect(findPost(client, 'd')?.id).toBe('d');
    expect(findPost(client, 'orig')).toBe(original);
    expect(findPost(client, 'nope')).toBeUndefined();
  });
});

describe('prependToFeed', () => {
  it('puts a new post first and never duplicates it', () => {
    const client = clientWith([makePost({ id: 'a' })]);
    prependToFeed(client, makePost({ id: 'new' }));
    prependToFeed(client, makePost({ id: 'new' }));
    expect(client.getQueryData<ReturnType<typeof makePost>[]>(postKeys.feed)?.map((p) => p.id)).toEqual(['new', 'a']);
  });
});
