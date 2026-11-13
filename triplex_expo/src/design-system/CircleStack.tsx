import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from './useTheme';

export interface CircleStackProps {
  /** Each child is one circle; the first is on top. Size children to `size - 4`. */
  children: ReactNode;
  /** Diameter of each circle slot, including the 2-pt cut-out ring around it. */
  size?: number;
}

/** Share of a circle that the next one tucks behind. */
const OVERLAP = 0.3;

/**
 * A row of overlapping circles, the first in front — the heart (or your reaction) with everyone's top
 * reactions peeking out behind it. Every slot is opaque in the screen's background colour, so a circle
 * in front is cut out of the ones behind it. The children stay interactive (the first one is a button).
 */
export function CircleStack({ children, size = 30 }: CircleStackProps) {
  const { colors } = useTheme();
  const items = Children.toArray(children);
  return (
    <View style={styles.row}>
      {items.map((child, index) => (
        <View
          key={index}
          style={[styles.slot, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.background, marginLeft: index === 0 ? 0 : -size * OVERLAP, zIndex: items.length - index }]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { alignItems: 'center', justifyContent: 'center' },
});
