import type { ReactionState } from './applyReaction';
import { reactionStateOf, withReaction } from './applyReaction';
import type { ReactionType } from './reactions';

export interface ReactionServer {
  /** Set my reaction on a post (or comment) to `type` (the server switches an existing reaction in place). */
  react: (id: string, type: ReactionType) => Promise<ReactionState>;
  /** Remove my reaction; `type` is the one currently on the server. */
  unreact: (id: string, type: ReactionType) => Promise<ReactionState>;
}

/**
 * `T` is whatever carries a reaction — a post, or a comment (anything with `myReaction` and
 * `reactionCount`). Ids are the post's / comment's own.
 */
export interface ReactionSyncPorts<T extends ReactionState = ReactionState> {
  server: ReactionServer;
  /** The item as the cache holds it now (including optimistic changes), or undefined if it is gone. */
  getPost: (id: string) => T | undefined;
  /** Rewrite every cached copy of the item. */
  patch: (id: string, update: (item: T) => T) => void;
  /** `failed` is what the user last asked for — enough to offer "Retry" (`set(failed.id, failed.desired)`). */
  onFailure: (error: unknown, failed: { id: string; desired: ReactionType | null }) => void;
  /** Called once the server agrees with the user's final choice (e.g. to refresh who-reacted summaries). */
  onConverged?: (id: string) => void;
}

interface Entry {
  /** The last state the server confirmed (initially: what the cache held before the first tap). */
  confirmed: ReactionState;
  /** Where the user wants the post to end up. */
  desired: ReactionType | null;
  running: boolean;
}

/**
 * Keeps a post's reaction in step with the server while the UI stays instant.
 *
 * A tap updates every cached copy of the post *immediately*, then this object makes the server agree.
 * Requests for one post run strictly one after another and **coalesce**: if the user taps 👍 → ❤️ → 👍
 * while the first request is still out, only the final wish matters, so at most one more request is
 * sent (and none if it already matches). Two reasons: concurrent requests can be applied by the server
 * in either order, and the last tap must win. If a request fails, the post snaps back to the last
 * state the server confirmed and any wishes still waiting are dropped — not replayed on top of a
 * state that never happened.
 */
export class ReactionSync<T extends ReactionState = ReactionState> {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly ports: ReactionSyncPorts<T>) {}

  /** Ask for `desired` (null = no reaction) on a post. Returns once the server has converged or failed. */
  set(postId: string, desired: ReactionType | null): Promise<void> {
    const post = this.ports.getPost(postId);
    if (!post) return Promise.resolve();

    let entry = this.entries.get(postId);
    if (!entry) {
      entry = { confirmed: reactionStateOf(post), desired, running: false };
      this.entries.set(postId, entry);
    }
    entry.desired = desired;
    this.ports.patch(postId, (p) => withReaction(p, desired));
    return entry.running ? Promise.resolve() : this.run(postId, entry);
  }

  private async run(postId: string, entry: Entry): Promise<void> {
    entry.running = true;
    try {
      // `sent` guards against a server that answers with something other than what was asked: its answer is
      // the truth, and asking again for the same thing would loop forever.
      let sent: ReactionType | null | undefined;
      while (entry.desired !== entry.confirmed.myReaction && entry.desired !== sent) {
        const { desired } = entry;
        sent = desired;
        entry.confirmed =
          desired === null
            ? await this.ports.server.unreact(postId, entry.confirmed.myReaction as ReactionType)
            : await this.ports.server.react(postId, desired);
      }
      // Converged. Take the server's own count (other people may have reacted meanwhile).
      const { confirmed } = entry;
      this.ports.patch(postId, (p) => ({ ...p, myReaction: confirmed.myReaction, reactionCount: confirmed.reactionCount }));
      this.ports.onConverged?.(postId);
    } catch (error) {
      const { confirmed } = entry;
      this.ports.patch(postId, (p) => ({ ...p, myReaction: confirmed.myReaction, reactionCount: confirmed.reactionCount }));
      this.ports.onFailure(error, { id: postId, desired: entry.desired });
    } finally {
      this.entries.delete(postId);
    }
  }
}
