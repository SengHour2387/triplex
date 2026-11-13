import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Icon } from './Icon';
import { useTheme } from './useTheme';

export interface RemoteImageProps {
  uri: string;
  /** Size and shape (radius). The image fills it. */
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain';
  /** Describes the picture for screen readers. Omit when the surrounding control already names it. */
  label?: string;
  /** Called with the picture's pixel size once it has loaded (the viewer needs it to bound panning). */
  onLoadSize?: (size: { width: number; height: number }) => void;
  /** Keeps a recycled list cell from showing the previous picture while the new one loads. */
  recyclingKey?: string;
}

/**
 * A picture from the network: cached on disk (`expo-image`), a quiet tinted tile while it loads, a
 * short cross-fade in (none with Reduce Motion), and a broken-image glyph — not a blank hole — if it
 * cannot be loaded.
 */
export function RemoteImage({ uri, style, contentFit = 'cover', label, onLoadSize, recyclingKey }: RemoteImageProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = failedUri === uri;

  if (failed) {
    return (
      <View style={[style as StyleProp<ViewStyle>, styles.broken, { backgroundColor: colors.controlFill }]} accessible={!!label} accessibilityLabel={label ? `${label}, couldn't load` : undefined}>
        <Icon name="brokenImage" size={28} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.controlFill }, style]}
      contentFit={contentFit}
      transition={reduceMotion ? 0 : 160}
      cachePolicy="disk"
      recyclingKey={recyclingKey}
      onError={() => setFailedUri(uri)}
      onLoad={onLoadSize ? (event) => onLoadSize({ width: event.source.width, height: event.source.height }) : undefined}
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  broken: { alignItems: 'center', justifyContent: 'center' },
});
