import { ActivityIndicator } from 'react-native';

import { useTheme } from '../useTheme';
import type { SpinnerProps } from './types';

/** iOS: `ActivityIndicator` already is the system `UIActivityIndicatorView`. */
export function Spinner({ size = 'small', color, label = 'Loading' }: SpinnerProps) {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={color ?? colors.textSecondary} accessibilityLabel={label} />;
}
export type { SpinnerProps } from './types';
