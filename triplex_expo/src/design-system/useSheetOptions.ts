import { resolveSheetBackground, sheetOptions, type SheetOptionsInput } from './sheet';
import { isSystemGlassAvailable } from './useSurfaceMode';
import { useTheme } from './useTheme';

/**
 * Screen options for a native bottom sheet, with the right background for this device and theme
 * (see `sheet.ts`). Call it in a layout and pass the result to `<Stack.Screen options={…}>`.
 */
export function useSheetOptions(input: Omit<SheetOptionsInput, 'background'>) {
  const { colors } = useTheme();
  return sheetOptions({ ...input, background: resolveSheetBackground(isSystemGlassAvailable(), colors.surface) });
}
