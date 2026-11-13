import { Stack } from 'expo-router';

import { ICONS } from '../icons';
import type { ToolbarItem, ToolbarPlacement } from './types';

export interface ToolbarProps {
  placement: ToolbarPlacement;
  items: readonly ToolbarItem[];
}

/**
 * Buttons and menus in the navigation bar. iOS: the system's own toolbar items — on iOS 26 real
 * Liquid Glass, with the menu drawn by UIKit. (Items are built here, as direct children of
 * `Stack.Toolbar`, because the router reads its children by type.)
 */
export function Toolbar({ placement, items }: ToolbarProps) {
  return (
    <Stack.Toolbar placement={placement}>
      {items.map((item) =>
        item.type === 'button' ? (
          <Stack.Toolbar.Button key={item.label} icon={ICONS[item.icon].sf} accessibilityLabel={item.label} disabled={item.disabled} onPress={item.onPress} />
        ) : (
          <Stack.Toolbar.Menu key={item.label} icon={ICONS[item.icon].sf} title={item.title} accessibilityLabel={item.label} disabled={item.disabled}>
            {item.actions.map((action) => (
              <Stack.Toolbar.MenuAction key={action.label} icon={action.icon ? ICONS[action.icon].sf : undefined} destructive={action.destructive} onPress={action.onPress}>
                {action.label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        ),
      )}
    </Stack.Toolbar>
  );
}
