// Native modules have no JS implementation under Jest. Mock them at the module boundary so
// design-system components can render; behaviour that depends on the real native view
// (glass, blur, SF Symbols) is verified on device — see the gallery and MIGRATION_PLAN.md.
//
// (Dependencies are required *inside* each factory: jest hoists `jest.mock` above imports.)

jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  // The stock mock lacks these hooks; give them inert, deterministic versions.
  return {
    ...mock,
    useReducedMotion: () => false,
    useAnimatedKeyboard: () => ({ height: { get: () => 0, set: () => {}, value: 0 } }),
  };
});

// Gesture Handler ships its own Jest setup (mocks the native module and the gesture detector).
require('react-native-gesture-handler/jestSetup');

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Image: (props: object) => React.createElement(View, props) };
});

jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassView: ({ children, ...props }: { children?: unknown }) => React.createElement(View, props, children),
    isLiquidGlassAvailable: () => false,
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, ...props }: { children?: unknown }) => React.createElement(View, props, children),
  };
});

jest.mock('expo-symbols', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { SymbolView: (props: object) => React.createElement(View, props) };
});

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// SwiftUI hosts have no JS implementation under Jest; render the picker's labels as pressable text.
jest.mock('@expo/ui/swift-ui', () => {
  const React = require('react');
  const { Pressable, Text: RNText, View } = require('react-native');
  return {
    Host: ({ children }: { children?: unknown }) => React.createElement(View, null, children),
    Picker: ({ children, onSelectionChange }: { children?: { props: { modifiers: { tag?: unknown }[]; children: string } }[]; onSelectionChange: (v: unknown) => void }) =>
      React.createElement(
        View,
        null,
        React.Children.map(children, (child: { props: { children: string; modifiers: unknown[] } }) =>
          React.createElement(
            Pressable,
            { accessibilityRole: 'radio', accessibilityLabel: child.props.children, onPress: () => onSelectionChange(child.props.children.toLowerCase()) },
            React.createElement(RNText, null, child.props.children),
          ),
        ),
      ),
    Text: ({ children }: { children?: unknown }) => React.createElement(RNText, null, children),
    // The remaining controls render as plain pressables that expose their props, enough to test the wrappers.
    Toggle: ({ isOn, label, onIsOnChange }: { isOn: boolean; label: string; onIsOnChange: (v: boolean) => void }) =>
      React.createElement(Pressable, { accessibilityRole: 'switch', accessibilityLabel: label, accessibilityState: { checked: isOn }, onPress: () => onIsOnChange(!isOn) }),
    Slider: ({ value, onValueChange, onEditingChanged }: { value: number; onValueChange: (v: number) => void; onEditingChanged: (e: boolean) => void }) =>
      React.createElement(Pressable, {
        accessibilityRole: 'adjustable',
        accessibilityValue: { now: value },
        onPress: () => {
          onValueChange(value + 0.1);
          onEditingChanged(false);
        },
      }),
    Stepper: ({ label, value, onValueChange }: { label: string; value: number; onValueChange: (v: number) => void }) =>
      React.createElement(Pressable, { accessibilityRole: 'adjustable', accessibilityLabel: label, accessibilityValue: { now: value }, onPress: () => onValueChange(value + 1) }),
    Menu: ({ label, children }: { label: string; children?: unknown }) => React.createElement(View, { accessibilityLabel: label }, children),
    Button: ({ label, onPress }: { label: string; onPress: () => void }) =>
      React.createElement(Pressable, { accessibilityRole: 'menuitem', accessibilityLabel: label, onPress }, React.createElement(RNText, null, label)),
    Divider: () => React.createElement(View),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => {
  const modifier = () => ({});
  return {
    pickerStyle: modifier,
    tag: modifier,
    labelsHidden: modifier,
    disabled: modifier,
    accessibilityLabel: modifier,
    buttonStyle: modifier,
    buttonBorderShape: modifier,
    controlSize: modifier,
    labelStyle: modifier,
  };
});
