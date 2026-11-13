import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { SFSymbol } from 'sf-symbols-typescript';

import type { IconName } from '../icons';

/**
 * Props shared by the native iOS control and the drawn (Android) one, so a screen writes
 * `<Switch …/>` once. (Type-only imports: shared by `Foo.tsx` and `Foo.ios.tsx`.)
 */

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Accessible name — what the switch controls ("Notifications"). Required: a bare switch says nothing. */
  label: string;
  disabled?: boolean;
  testID?: string;
}

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  /** Called once when the finger lifts. */
  onSlidingComplete?: (value: number) => void;
  min?: number;
  max?: number;
  /** Snap increment. Omit for a continuous slider. */
  step?: number;
  label: string;
  disabled?: boolean;
  testID?: string;
}

export interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  disabled?: boolean;
  testID?: string;
}

export interface SpinnerProps {
  size?: 'small' | 'large';
  /** Any colour string. Defaults to the secondary text colour. */
  color?: string;
  /** Accessible name. Defaults to "Loading". */
  label?: string;
}

export interface MenuItem {
  label: string;
  /** Semantic icon (an SF Symbol on iOS, a Material glyph elsewhere). */
  icon?: IconName;
  destructive?: boolean;
  disabled?: boolean;
  /** Shows a check mark — for menus that pick one option. */
  selected?: boolean;
  onPress: () => void;
}

/** A menu entry: an action, or `'divider'` for a thicker break between groups. */
export type MenuEntry = MenuItem | 'divider';

export interface MenuProps {
  /** Accessible name of the trigger button ("More options"). */
  label: string;
  items: readonly MenuEntry[];
  /** The glyph on the trigger. Defaults to "more". */
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
}

export type DialogActionStyle = 'default' | 'cancel' | 'destructive';

export interface DialogAction {
  label: string;
  style?: DialogActionStyle;
  /** The suggested choice: bold on iOS, a solid button in the drawn alert. Use for the safe, expected answer. */
  preferred?: boolean;
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  /** Left → right (2 actions) or top → bottom (3+). Defaults to a single "OK". */
  actions?: readonly DialogAction[];
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  /** The choices. A `cancel` action here is lifted into the separate Cancel button. */
  actions: readonly DialogAction[];
}

export interface ToolbarButtonItem {
  type: 'button';
  icon: IconName;
  /** Accessible name — icon-only buttons need one. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface ToolbarMenuAction {
  label: string;
  icon?: IconName;
  destructive?: boolean;
  onPress: () => void;
}

export interface ToolbarMenuItem {
  type: 'menu';
  icon: IconName;
  label: string;
  /** Title shown at the top of the menu (iOS). */
  title?: string;
  actions: readonly ToolbarMenuAction[];
  disabled?: boolean;
}

export type ToolbarItem = ToolbarButtonItem | ToolbarMenuItem;

export type ToolbarPlacement = 'left' | 'right';

/** One bottom tab. */
export interface AppTab {
  /** The route name (`(profile)`, `index`, …). */
  name: string;
  label: string;
  icon: {
    sf: SFSymbol | { default: SFSymbol; selected: SFSymbol };
    /** Material glyph, drawn on Android. */
    md: ComponentProps<typeof MaterialIcons>['name'];
    /** Material glyph while selected (the filled twin). Defaults to `md`. */
    mdSelected?: ComponentProps<typeof MaterialIcons>['name'];
  };
  badge?: string | number;
}
