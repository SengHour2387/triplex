import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../../../core/logger';
import type { Post } from './post';
import { feedSnapshotSchema } from './schemas';

/**
 * The last feed, kept on disk so the next launch shows *something* instantly while the network answers
 * (Flutter did this with a Drift table). It is per user — a different account on the same phone must
 * never see it — and removed on sign-out. A snapshot that no longer matches the current `Post` shape
 * (after an app update) is thrown away rather than rendered half-broken.
 */
const KEY = 'triplex.feedSnapshot.v1';
export const SNAPSHOT_LIMIT = 30;

interface Stored {
  userId: string;
  posts: Post[];
}

export async function loadFeedSnapshot(userId: string): Promise<Post[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (stored.userId !== userId) return null;
    const parsed = feedSnapshotSchema.safeParse(stored.posts);
    return parsed.success && parsed.data.length > 0 ? parsed.data : null;
  } catch (error) {
    logger.warn('[feed] could not read the saved feed', error);
    return null;
  }
}

export async function saveFeedSnapshot(userId: string, posts: Post[]): Promise<void> {
  try {
    const stored: Stored = { userId, posts: posts.slice(0, SNAPSHOT_LIMIT) };
    await AsyncStorage.setItem(KEY, JSON.stringify(stored));
  } catch (error) {
    logger.warn('[feed] could not save the feed', error);
  }
}

export async function clearFeedSnapshot(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (error) {
    logger.warn('[feed] could not clear the saved feed', error);
  }
}
