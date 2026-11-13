import { MaterialIcons } from '@expo/vector-icons';

import { ICONS, type IconProps } from './icons';
import { useTheme } from './useTheme';

/**
 * Non-iOS icon (Material glyphs). iOS gets SF Symbols from `Icon.ios.tsx`.
 * UNVERIFIED on Android until the Android pass (MIGRATION_PLAN.md).
 */
export function Icon({ name, size = 20, color, label }: IconProps) {
  const { colors } = useTheme();
  return (
    <MaterialIcons
      name={ICONS[name].md}
      size={size}
      color={color ?? colors.text}
      accessibilityLabel={label}
      accessible={Boolean(label)}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}
