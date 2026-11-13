import { CircleStack } from './CircleStack';
import { EmojiBadge } from './EmojiBadge';

export interface EmojiStackProps {
  /** Up to three or so, most important first (it sits on top). */
  emojis: readonly string[];
  /** Slot size (see `CircleStack`). */
  size?: number;
}

/** Overlapping round emoji, the first on top — "the reactions on this post". Decorative. */
export function EmojiStack({ emojis, size = 30 }: EmojiStackProps) {
  return (
    <CircleStack size={size}>
      {emojis.map((emoji, index) => (
        <EmojiBadge key={`${emoji}-${index}`} emoji={emoji} size={size - 4} />
      ))}
    </CircleStack>
  );
}
