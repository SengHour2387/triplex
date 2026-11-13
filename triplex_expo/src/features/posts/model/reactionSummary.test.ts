import { otherReactionTypes, topReactionTypes } from './reactionSummary';

describe('topReactionTypes', () => {
  it('orders by count and keeps the top three', () => {
    expect(
      topReactionTypes([
        { type: 'like', count: 2 },
        { type: 'love', count: 9 },
        { type: 'haha', count: 5 },
        { type: 'wow', count: 1 },
      ]),
    ).toEqual(['love', 'haha', 'like']);
  });

  it('keeps the server order on a tie, and skips empty counts', () => {
    expect(
      topReactionTypes([
        { type: 'wow', count: 3 },
        { type: 'like', count: 3 },
        { type: 'sad', count: 0 },
      ]),
    ).toEqual(['wow', 'like']);
  });

  it('is empty for a post with no reactions', () => {
    expect(topReactionTypes([])).toEqual([]);
  });
});

describe('otherReactionTypes', () => {
  it("leaves out the user's own reaction (it is the front slot) and keeps the next two", () => {
    expect(otherReactionTypes(['love', 'like', 'haha'], 'love')).toEqual(['like', 'haha']);
    expect(otherReactionTypes(['love', 'like', 'haha'], null)).toEqual(['love', 'like']);
  });

  it('is empty when the only reaction is the' + " user's own", () => {
    expect(otherReactionTypes(['love'], 'love')).toEqual([]);
    expect(otherReactionTypes([], null)).toEqual([]);
  });

  it('shows another person’s single reaction', () => {
    expect(otherReactionTypes(['love'], 'like')).toEqual(['love']);
  });
});
