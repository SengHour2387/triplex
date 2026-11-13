import { Host, Stepper as SwiftStepper } from '@expo/ui/swift-ui';
import { disabled as disabledModifier, labelsHidden } from '@expo/ui/swift-ui/modifiers';

import { useTheme } from '../useTheme';
import type { StepperProps } from './types';

/** iOS: the system stepper (SwiftUI `Stepper`), label hidden — the value is shown by the caller. */
export function Stepper({ value, onValueChange, min = 0, max = 100, step = 1, label, disabled = false }: StepperProps) {
  const { scheme } = useTheme();
  return (
    <Host matchContents colorScheme={scheme}>
      <SwiftStepper label={label} value={value} min={min} max={max} step={step} onValueChange={onValueChange} modifiers={[labelsHidden(), disabledModifier(disabled)]} />
    </Host>
  );
}
export type { StepperProps } from './types';
