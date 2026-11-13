import type { ReactionType } from './reactions';

/** The reaction-related part of a post: what one tap changes, and what the server confirms. */
export interface ReactionState {
  myReaction: ReactionType | null;
  reactionCount: number;
}

/**
 * What a tap on the like button does: react with a Like, or — if there is already a reaction of any
 * kind — remove it. (Flutter: tapping a ❤️ removes the ❤️, it does not turn it into a 👍.)
 */
export const nextReactionForTap = (current: ReactionType | null): ReactionType | null => (current === null ? 'like' : null);

/** Picking from the long-press picker: choosing the one you already have removes it. */
export const nextReactionForPick = (current: ReactionType | null, picked: ReactionType): ReactionType | null =>
  current === picked ? null : picked;

/**
 * The optimistic result of moving a post to `desired`: adding a reaction is +1, switching kind is ±0,
 * removing is −1 (never below 0). The server's own count replaces this once it answers.
 */
export function withReaction<T extends ReactionState>(post: T, desired: ReactionType | null): T {
  if (post.myReaction === desired) return post;
  const had = post.myReaction !== null;
  const has = desired !== null;
  const delta = has && !had ? 1 : !has && had ? -1 : 0;
  return { ...post, myReaction: desired, reactionCount: Math.max(0, post.reactionCount + delta) };
}

export const reactionStateOf = (item: ReactionState): ReactionState => ({ myReaction: item.myReaction, reactionCount: item.reactionCount });
