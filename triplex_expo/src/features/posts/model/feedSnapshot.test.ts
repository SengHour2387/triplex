import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearFeedSnapshot, loadFeedSnapshot, saveFeedSnapshot, SNAPSHOT_LIMIT } from './feedSnapshot';
import { makePost } from './fixtures';

beforeEach(() => AsyncStorage.clear());

describe('feed snapshot', () => {
  it('round-trips the feed for the same user', async () => {
    await saveFeedSnapshot('u1', [makePost({ id: 'a', caption: 'hi' })]);
    expect((await loadFeedSnapshot('u1'))?.[0]).toMatchObject({ id: 'a', caption: 'hi' });
  });

  it('is never shown to a different account on the same phone', async () => {
    await saveFeedSnapshot('u1', [makePost()]);
    expect(await loadFeedSnapshot('u2')).toBeNull();
  });

  it('keeps only the newest posts', async () => {
    await saveFeedSnapshot('u1', Array.from({ length: SNAPSHOT_LIMIT + 10 }, (_, i) => makePost({ id: `p${i}` })));
    expect(await loadFeedSnapshot('u1')).toHaveLength(SNAPSHOT_LIMIT);
  });

  it('is cleared on sign-out', async () => {
    await saveFeedSnapshot('u1', [makePost()]);
    await clearFeedSnapshot();
    expect(await loadFeedSnapshot('u1')).toBeNull();
  });

  it('throws away a snapshot in an old shape instead of rendering it', async () => {
    await AsyncStorage.setItem('triplex.feedSnapshot.v1', JSON.stringify({ userId: 'u1', posts: [{ id: 'x', likes_count: 1 }] }));
    expect(await loadFeedSnapshot('u1')).toBeNull();
  });

  it('survives corrupt storage', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await AsyncStorage.setItem('triplex.feedSnapshot.v1', '{not json');
    expect(await loadFeedSnapshot('u1')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
