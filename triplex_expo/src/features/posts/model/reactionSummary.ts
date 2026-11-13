import type { ReactionType } from './reactions';

export interface ReactionCount {
  type: ReactionType;
  count: number;
}

/** The most-used reactions on a post, most used first (ties keep the server's order), at most `limit`. */
export function topReactionTypes(reactions: readonly ReactionCount[], limit = 3): ReactionType[] {
  return reactions
    .map((r, index) => ({ ...r, index }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .slice(0, limit)
    .map((r) => r.type);
}

/**
 * The reactions drawn *behind* the front slot of the reaction cluster: the top reactions other than the
 * user's own (their reaction is the front slot, instead of the heart), at most `limit`.
 */
export function otherReactionTypes(top: readonly ReactionType[], mine: ReactionType | null, limit = 2): ReactionType[] {
  return top.filter((type) => type !== mine).slice(0, limit);
}
