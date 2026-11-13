import { nextReactionForPick, nextReactionForTap, withReaction } from './applyReaction';
import { makePost } from './fixtures';

describe('what a tap does', () => {
  it('likes when there is no reaction, removes any reaction when there is one', () => {
    expect(nextReactionForTap(null)).toBe('like');
    expect(nextReactionForTap('like')).toBeNull();
    expect(nextReactionForTap('love')).toBeNull();
  });

  it('picking the reaction you already have removes it; another one switches', () => {
    expect(nextReactionForPick('love', 'love')).toBeNull();
    expect(nextReactionForPick('love', 'wow')).toBe('wow');
    expect(nextReactionForPick(null, 'haha')).toBe('haha');
  });
});

describe('withReaction (optimistic count)', () => {
  it('adds one when reacting for the first time', () => {
    expect(withReaction(makePost({ reactionCount: 4 }), 'love')).toMatchObject({ myReaction: 'love', reactionCount: 5 });
  });

  it('keeps the count when switching kind', () => {
    expect(withReaction(makePost({ reactionCount: 4, myReaction: 'like' }), 'love')).toMatchObject({ myReaction: 'love', reactionCount: 4 });
  });

  it('removes one when unreacting, never below zero', () => {
    expect(withReaction(makePost({ reactionCount: 4, myReaction: 'like' }), null)).toMatchObject({ myReaction: null, reactionCount: 3 });
    expect(withReaction(makePost({ reactionCount: 0, myReaction: 'like' }), null).reactionCount).toBe(0);
  });

  it('returns the same object when nothing changes', () => {
    const post = makePost({ myReaction: 'like', reactionCount: 1 });
    expect(withReaction(post, 'like')).toBe(post);
  });
});
