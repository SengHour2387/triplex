import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { MAX_FONT_SCALE, typography, type ColorTokens, type TextVariant } from './tokens';
import { useFontScale } from './useFontScale';
import { useTheme } from './useTheme';

export type TextColor = keyof Pick<ColorTokens, 'text' | 'textSecondary' | 'accent' | 'error' | 'onPrimary'>;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Semantic colour from the theme. Defaults to `text`. */
  color?: TextColor;
  weight?: '400' | '500' | '600' | '700';
}

export function Text({ variant = 'body', color = 'text', weight, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const token = typography[variant];
  const fontScale = useFontScale();
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[token, { lineHeight: Math.round(token.lineHeight * fontScale) }, { color: colors[color] }, weight ? { fontWeight: weight } : null, style]}
    />
  );
}
