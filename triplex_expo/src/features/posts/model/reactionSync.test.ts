import { makePost } from './fixtures';
import type { Post } from './post';
import type { ReactionType } from './reactions';
import { ReactionSync, type ReactionServer } from './reactionSync';
import type { ReactionState } from './applyReaction';

/** A server that answers when the test says so, and holds the truth like the real one. */
function setup(initial: Partial<Post> = {}) {
  let post: Post = makePost({ reactionCount: 10, ...initial });
  const patch = jest.fn((_id: string, update: (p: Post) => Post) => {
    post = update(post);
  });
  const onFailure = jest.fn();

  let serverState: ReactionState = { myReaction: post.myReaction, reactionCount: post.reactionCount };
  const calls: string[] = [];
  const pending: { resolve: (s: ReactionState) => void; reject: (e: unknown) => void }[] = [];
  const answer = (apply: () => void) =>
    new Promise<ReactionState>((resolve, reject) => {
      pending.push({
        resolve: () => {
          apply();
          resolve({ ...serverState });
        },
        reject,
      });
    });

  const server: ReactionServer = {
    react: (_id, type) => {
      calls.push(`react:${type}`);
      return answer(() => {
        const had = serverState.myReaction !== null;
        serverState = { myReaction: type, reactionCount: serverState.reactionCount + (had ? 0 : 1) };
      });
    },
    unreact: (_id, type) => {
      calls.push(`unreact:${type}`);
      return answer(() => {
        serverState = { myReaction: null, reactionCount: serverState.reactionCount - 1 };
      });
    },
  };

  const sync = new ReactionSync({ server, getPost: () => post, patch, onFailure });
  const flush = () => new Promise<void>((r) => setImmediate(() => r()));
  return { sync, calls, pending, get post() { return post; }, onFailure, flush, setServer: (s: ReactionState) => (serverState = s) };
}

describe('ReactionSync', () => {
  it('updates the post at once, before the server answers', async () => {
    const t = setup();
    const done = t.sync.set('p1', 'love');
    expect(t.post).toMatchObject({ myReaction: 'love', reactionCount: 11 });
    t.pending[0].resolve({ myReaction: 'love', reactionCount: 11 });
    await done;
    expect(t.calls).toEqual(['react:love']);
  });

  it('takes the server count when it differs from the guess', async () => {
    const t = setup();
    t.setServer({ myReaction: null, reactionCount: 25 });
    const done = t.sync.set('p1', 'like');
    t.pending[0].resolve({ myReaction: 'like', reactionCount: 26 });
    await done;
    expect(t.post).toMatchObject({ myReaction: 'like', reactionCount: 26 });
  });

  it('removes with the type the server holds', async () => {
    const t = setup({ myReaction: 'wow', reactionCount: 3 });
    const done = t.sync.set('p1', null);
    expect(t.post).toMatchObject({ myReaction: null, reactionCount: 2 });
    t.pending[0].resolve({ myReaction: null, reactionCount: 2 });
    await done;
    expect(t.calls).toEqual(['unreact:wow']);
  });

  it('coalesces taps made while a request is out: only the last wish is sent', async () => {
    const t = setup();
    const first = t.sync.set('p1', 'like'); // request 1 goes out
    void t.sync.set('p1', 'love');
    void t.sync.set('p1', 'haha');
    expect(t.post.myReaction).toBe('haha'); // the UI followed every tap
    t.pending[0].resolve({ myReaction: 'like', reactionCount: 11 });
    await t.flush();
    expect(t.calls).toEqual(['react:like', 'react:haha']); // 'love' was never sent
    t.pending[1].resolve({ myReaction: 'haha', reactionCount: 11 });
    await first;
    expect(t.post).toMatchObject({ myReaction: 'haha', reactionCount: 11 });
  });

  it('undoes a reaction the user withdrew while it was still being sent', async () => {
    const t = setup();
    const first = t.sync.set('p1', 'like');
    void t.sync.set('p1', null); // changed their mind before the answer
    t.pending[0].resolve({ myReaction: 'like', reactionCount: 11 });
    await t.flush();
    // The server now has "like" but the user wants none → one unreact, not a stuck 👍.
    expect(t.calls).toEqual(['react:like', 'unreact:like']);
    t.pending[1].resolve({ myReaction: null, reactionCount: 10 });
    await first;
    expect(t.post).toMatchObject({ myReaction: null, reactionCount: 10 });
  });

  it('reverts to the last confirmed state and reports when a request fails', async () => {
    const t = setup({ myReaction: 'like', reactionCount: 5 });
    const done = t.sync.set('p1', 'love');
    expect(t.post.myReaction).toBe('love');
    t.pending[0].reject(new Error('offline'));
    await done;
    expect(t.post).toMatchObject({ myReaction: 'like', reactionCount: 5 });
    expect(t.onFailure).toHaveBeenCalledTimes(1);
    // It says what the user wanted, so the toast can offer to ask again.
    expect(t.onFailure).toHaveBeenCalledWith(expect.any(Error), { id: 'p1', desired: 'love' });
  });

  it('drops queued wishes after a failure instead of replaying them on a state that never happened', async () => {
    const t = setup();
    const done = t.sync.set('p1', 'like');
    void t.sync.set('p1', 'love');
    t.pending[0].reject(new Error('500'));
    await done;
    expect(t.calls).toEqual(['react:like']);
    expect(t.post).toMatchObject({ myReaction: null, reactionCount: 10 });
  });

  it('can react again after a failure', async () => {
    const t = setup();
    const failed = t.sync.set('p1', 'like');
    t.pending[0].reject(new Error('500'));
    await failed;
    const retry = t.sync.set('p1', 'like');
    t.pending[1].resolve({ myReaction: 'like', reactionCount: 11 });
    await retry;
    expect(t.post.myReaction).toBe('like');
  });

  it('tells the caller when the server has agreed (so summaries can refresh), and not when it failed', async () => {
    const onConverged = jest.fn();
    const ok = setup();
    // (rebuild the sync with the extra port on the same fake server)
    const sync = new ReactionSync({ server: { react: async () => ({ myReaction: 'like', reactionCount: 11 }), unreact: async () => ({ myReaction: null, reactionCount: 10 }) }, getPost: () => ok.post, patch: () => undefined, onFailure: jest.fn(), onConverged });
    await sync.set('p1', 'like');
    expect(onConverged).toHaveBeenCalledWith('p1');

    onConverged.mockClear();
    const failing = new ReactionSync({ server: { react: async () => Promise.reject(new Error('x')), unreact: jest.fn() }, getPost: () => ok.post, patch: () => undefined, onFailure: jest.fn(), onConverged });
    await failing.set('p1', 'love');
    expect(onConverged).not.toHaveBeenCalled();
  });

  it('accepts what the server says if it differs from what was asked — it never asks again in a loop', async () => {
    const react = jest.fn().mockResolvedValue({ myReaction: 'love', reactionCount: 11 }); // asked for 'like'
    const post = makePost({ reactionCount: 10 });
    let current = post;
    const sync = new ReactionSync({
      server: { react, unreact: jest.fn() },
      getPost: () => current,
      patch: (_id, update) => {
        current = update(current);
      },
      onFailure: jest.fn(),
    });
    await sync.set('p1', 'like');
    expect(react).toHaveBeenCalledTimes(1);
    expect(current).toMatchObject({ myReaction: 'love', reactionCount: 11 });
  });

  it('still follows a changed wish made while a request was out', async () => {
    const answers: Record<string, { myReaction: 'like' | 'love'; reactionCount: number }> = { like: { myReaction: 'like', reactionCount: 11 }, love: { myReaction: 'love', reactionCount: 11 } };
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const react = jest.fn(async (_id: string, type: string) => {
      if (react.mock.calls.length === 1) await gate;
      return answers[type];
    });
    let current = makePost({ reactionCount: 10 });
    const sync = new ReactionSync({
      server: { react, unreact: jest.fn() },
      getPost: () => current,
      patch: (_id, update) => {
        current = update(current);
      },
      onFailure: jest.fn(),
    });
    const first = sync.set('p1', 'like');
    void sync.set('p1', 'love'); // changed their mind while the first request was out
    release();
    await first;
    expect(react.mock.calls.map((c) => c[1])).toEqual(['like', 'love']);
    expect(current.myReaction).toBe('love');
  });

  it('ignores a post that is no longer cached', async () => {
    const sync = new ReactionSync({
      server: { react: jest.fn(), unreact: jest.fn() },
      getPost: () => undefined,
      patch: jest.fn(),
      onFailure: jest.fn(),
    });
    await expect(sync.set('gone', 'like' as ReactionType)).resolves.toBeUndefined();
  });
});
