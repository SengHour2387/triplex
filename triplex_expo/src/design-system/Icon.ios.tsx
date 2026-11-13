import { SymbolView } from 'expo-symbols';

import { ICONS, type IconProps } from './icons';
import { useTheme } from './useTheme';

export function Icon({ name, size = 20, color, label }: IconProps) {
  const { colors } = useTheme();
  return (
    <SymbolView
      name={ICONS[name].sf}
      size={size}
      tintColor={color ?? colors.text}
      resizeMode="scaleAspectFit"
      style={{ width: size, height: size }}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}
