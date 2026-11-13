/**
 * The seven reactions the backend accepts (`likes/:postId/like { type }`, api_doc §3.9), in the order
 * the picker shows them. Nothing here is a colour: the emoji carries the meaning, and the count next
 * to it stays in the theme's text colour (the brand tints Flutter used — amber, light blue — fail AA
 * contrast on the white canvas).
 */
export const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'cry', 'angry'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export interface ReactionInfo {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: readonly ReactionInfo[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'cry', emoji: '😭', label: 'Cry' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
];

const BY_TYPE = new Map(REACTIONS.map((r) => [r.type, r]));

export const reactionInfo = (type: ReactionType): ReactionInfo => BY_TYPE.get(type) ?? REACTIONS[0];

/**
 * Narrows a string from the server to a known reaction. A type this app doesn't know yet (the backend
 * gained one) is shown as a plain Like rather than failing the whole response.
 */
export function toReactionType(value: string | null | undefined): ReactionType | null {
  if (value === null || value === undefined || value === '') return null;
  return (REACTION_TYPES as readonly string[]).includes(value) ? (value as ReactionType) : 'like';
}
