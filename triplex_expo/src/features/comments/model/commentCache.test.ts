import { QueryClient } from '@tanstack/react-query';

import { threadRoot } from './comment';
import { appendComment, asDeleted, commentKeys, confirmComment, findComment, patchComment, removeComment } from './commentCache';
import { makeComment } from './fixtures';

function setup() {
  const client = new QueryClient();
  const top = makeComment({ id: 'a', replyCount: 1 });
  const other = makeComment({ id: 'b' });
  const reply = makeComment({ id: 'r1', parentId: 'a' });
  client.setQueryData(commentKeys.list('p1'), [top, other]);
  client.setQueryData(commentKeys.replies('a'), [reply]);
  return { client, top, other, reply };
}

describe('comment cache', () => {
  it('patches a comment in a top-level list or a replies list, leaving the others as the same objects', () => {
    const { client, top, other, reply } = setup();
    patchComment(client, 'r1', (c) => ({ ...c, reactionCount: 4 }));
    expect(client.getQueryData(commentKeys.replies('a'))).toEqual([{ ...reply, reactionCount: 4 }]);
    expect(client.getQueryData<unknown[]>(commentKeys.list('p1'))?.[0]).toBe(top);
    patchComment(client, 'b', (c) => ({ ...c, reactionCount: 1 }));
    expect(client.getQueryData<unknown[]>(commentKeys.list('p1'))?.[0]).toBe(top);
    expect(findComment(client, 'b')).toMatchObject({ reactionCount: 1 });
    expect(other.reactionCount).toBe(0);
  });

  it('appends a top-level comment at the end (oldest first)', () => {
    const { client } = setup();
    appendComment(client, makeComment({ id: 'n' }));
    expect(client.getQueryData<{ id: string }[]>(commentKeys.list('p1'))?.map((c) => c.id)).toEqual(['a', 'b', 'n']);
  });

  it('a reply goes at the end of its replies and counts under its parent; taking it back undoes both', () => {
    const { client } = setup();
    const draft = makeComment({ id: 'r2', parentId: 'a' });
    appendComment(client, draft);
    expect(client.getQueryData<{ id: string }[]>(commentKeys.replies('a'))?.map((c) => c.id)).toEqual(['r1', 'r2']);
    expect(findComment(client, 'a')?.replyCount).toBe(2);
    removeComment(client, draft);
    expect(client.getQueryData<{ id: string }[]>(commentKeys.replies('a'))?.map((c) => c.id)).toEqual(['r1']);
    expect(findComment(client, 'a')?.replyCount).toBe(1);
  });

  it("doesn't invent a list that was never loaded", () => {
    const client = new QueryClient();
    appendComment(client, makeComment({ id: 'n', postId: 'zzz' }));
    expect(client.getQueryData(commentKeys.list('zzz'))).toBeUndefined();
  });

  it('the server copy replaces the placeholder in place', () => {
    const { client } = setup();
    appendComment(client, makeComment({ id: 'pending-1', pending: true }));
    confirmComment(client, 'pending-1', makeComment({ id: 'real-9' }));
    expect(client.getQueryData<{ id: string; pending: boolean }[]>(commentKeys.list('p1'))?.map((c) => [c.id, c.pending])).toEqual([['a', false], ['b', false], ['real-9', false]]);
  });

  it('a deleted comment loses its text, author and reactions but keeps its place and its replies count', () => {
    const gone = asDeleted(makeComment({ id: 'a', replyCount: 2, reactionCount: 3, myReaction: 'love' }));
    expect(gone).toMatchObject({ isDeleted: true, content: '', author: null, myReaction: null, reactionCount: 0, replyCount: 2 });
  });

  it('a reply to a reply attaches to the top-level comment', () => {
    expect(threadRoot({ id: 'r1', parentId: 'a' })).toBe('a');
    expect(threadRoot({ id: 'a', parentId: null })).toBe('a');
  });
});
