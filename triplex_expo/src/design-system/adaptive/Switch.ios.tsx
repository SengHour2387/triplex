import { Host, Toggle } from '@expo/ui/swift-ui';
import { disabled as disabledModifier, labelsHidden } from '@expo/ui/swift-ui/modifiers';

import { useTheme } from '../useTheme';
import type { SwitchProps } from './types';

/** iOS: the system switch (SwiftUI `Toggle`) — on iOS 26 the wide glass-knob UISwitch, with its own haptics. */
export function Switch({ value, onValueChange, label, disabled = false }: SwitchProps) {
  const { scheme } = useTheme();
  return (
    <Host matchContents colorScheme={scheme}>
      <Toggle isOn={value} label={label} onIsOnChange={onValueChange} modifiers={[labelsHidden(), disabledModifier(disabled)]} />
    </Host>
  );
}
export type { SwitchProps } from './types';
