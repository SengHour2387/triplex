import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * An icon for a native header toolbar item. iOS draws SF Symbols; Android's toolbar only accepts an
 * *image source*, so it gets the matching Material glyph rendered to a bitmap (see
 * `useToolbarIcon.tsx`). (Type-only imports: this file is shared by both platform implementations.)
 */
export interface ToolbarIconSpec {
  sf: SFSymbol;
  md: ComponentProps<typeof MaterialIcons>['name'];
}

export type ToolbarIcon = SFSymbol | ImageSourcePropType;
