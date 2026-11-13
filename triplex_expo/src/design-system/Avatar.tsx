import { StyleSheet, View } from 'react-native';

import { RemoteImage } from './RemoteImage';
import { Text } from './Text';
import { useTheme } from './useTheme';

export interface AvatarProps {
  /** Profile picture URL. Missing or unloadable → the first letter of `name`. */
  uri?: string | null;
  /** Used for the fallback letter. */
  name: string;
  size?: number;
}

/**
 * A round profile picture. The fallback is a letter on a tint (as in Flutter's feed cards), so a
 * person with no photo is still recognisable at a glance. Decorative: the name is always written next
 * to it, so it is hidden from screen readers.
 */
export function Avatar({ uri, name, size = 36 }: AvatarProps) {
  const { colors } = useTheme();
  const box = { width: size, height: size, borderRadius: size / 2 };
  const letter = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <View style={[styles.box, box, { backgroundColor: colors.controlFill }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {uri ? (
        <RemoteImage uri={uri} style={box} recyclingKey={uri} />
      ) : (
        <Text variant={size >= 32 ? 'subhead' : 'caption'} weight="700" style={{ fontSize: Math.round(size * 0.4) }}>
          {letter}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
