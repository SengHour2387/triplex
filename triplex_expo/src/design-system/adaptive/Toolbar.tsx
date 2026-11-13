import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Glass } from '../Glass';
import { Icon } from '../Icon';
import { DrawnMenu } from './drawn/DrawnMenu';
import { GlassIconButton } from './drawn/GlassIconButton';
import type { ToolbarItem, ToolbarPlacement } from './types';

export interface ToolbarProps {
  placement: ToolbarPlacement;
  items: readonly ToolbarItem[];
}

/**
 * The drawn header's items. As in iOS 26, neighbouring buttons share **one** glass capsule (a single
 * button is a circle); a button may open a menu.
 */
export function ToolbarItems({ items }: { items: readonly ToolbarItem[] }) {
  return (
    <Glass interactive radius="pill" style={styles.group}>
      {items.map((item) =>
        item.type === 'button' ? (
          <GlassIconButton key={item.label} bare label={item.label} disabled={item.disabled} onPress={item.onPress}>
            <Icon name={item.icon} size={20} />
          </GlassIconButton>
        ) : (
          <DrawnMenu
            key={item.label}
            bare
            label={item.label}
            icon={item.icon}
            disabled={item.disabled}
            items={item.actions.map((action) => ({ label: action.label, icon: action.icon, destructive: action.destructive, onPress: action.onPress }))}
          />
        ),
      )}
    </Glass>
  );
}

/**
 * Buttons and menus in the navigation bar. Android: handed to the drawn header (`AppHeader`) as the
 * screen's left / right slot, so they look like iOS 26's glass toolbar buttons. iOS draws its own
 * (`Toolbar.ios.tsx`).
 */
export function Toolbar({ placement, items }: ToolbarProps) {
  const render = () => <ToolbarItems items={items} />;
  return <Stack.Screen options={placement === 'left' ? { headerLeft: render } : { headerRight: render }} />;
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', alignItems: 'center' },
});
