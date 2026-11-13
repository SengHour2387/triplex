import { Host, Slider as SwiftSlider } from '@expo/ui/swift-ui';
import { accessibilityLabel, disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers';
import { useRef } from 'react';

import { useTheme } from '../useTheme';
import type { SliderProps } from './types';

/** iOS: the system slider (SwiftUI `Slider`), tinted with the app's accent. */
export function Slider({ value, onValueChange, onSlidingComplete, min = 0, max = 1, step, label, disabled = false }: SliderProps) {
  const { scheme, colors } = useTheme();
  const latest = useRef(value);
  return (
    <Host matchContents={{ vertical: true }} colorScheme={scheme} seedColor={colors.accent} style={{ alignSelf: 'stretch' }}>
      <SwiftSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next: number) => {
          latest.current = next;
          onValueChange(next);
        }}
        onEditingChanged={(editing: boolean) => {
          if (!editing) onSlidingComplete?.(latest.current);
        }}
        modifiers={[accessibilityLabel(label), disabledModifier(disabled)]}
      />
    </Host>
  );
}
export type { SliderProps } from './types';
