import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { View } from 'react-native';

import type { OptionPickerProps } from './optionPickerTypes';
import { useTheme } from './useTheme';

/**
 * iOS: the system segmented control (SwiftUI `Picker`) — on iOS 26 it is drawn as Liquid Glass by
 * the OS, and on earlier iOS as the classic segmented control. Dynamic Type and VoiceOver come free.
 */
export function OptionPicker<T extends string>({ label, value, options, onChange }: OptionPickerProps<T>) {
  const { scheme } = useTheme();
  return (
    <View accessible={false} accessibilityLabel={label}>
      <Host matchContents={{ vertical: true }} colorScheme={scheme} style={{ width: '100%' }}>
        <Picker label={label} selection={value} onSelectionChange={(next: T) => onChange(next)} modifiers={[pickerStyle('segmented')]}>
          {options.map((option) => (
            <Text key={option.value} modifiers={[tag(option.value)]}>
              {option.label}
            </Text>
          ))}
        </Picker>
      </Host>
    </View>
  );
}
