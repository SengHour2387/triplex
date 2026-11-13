import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import type { ToolbarIcon, ToolbarIconSpec } from './toolbarIcon';
import { useTheme } from './useTheme';

const SIZE = 24;

/**
 * Android: the Material glyph rendered to a bitmap in the current text colour (the toolbar takes an
 * image source, not a symbol name). `undefined` for the first frame while the bitmap is made — the
 * item then simply appears a moment later. Re-renders in the new colour when the theme changes.
 * UNVERIFIED beyond the Pixel emulator until the Android pass (TODO-001).
 */
export function useToolbarIcon({ md }: ToolbarIconSpec): ToolbarIcon | undefined {
  const { colors } = useTheme();
  const [source, setSource] = useState<ImageSourcePropType | undefined>();

  useEffect(() => {
    let active = true;
    MaterialIcons.getImageSource(md, SIZE, colors.text).then(
      (image) => {
        if (active && image) setSource(image);
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [md, colors.text]);

  return source;
}
