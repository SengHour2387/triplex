import { Button, Divider, Host, Menu as SwiftMenu } from '@expo/ui/swift-ui';
import { buttonBorderShape, buttonStyle, controlSize, disabled as disabledModifier, labelStyle } from '@expo/ui/swift-ui/modifiers';

import { ICONS } from '../icons';
import { useTheme } from '../useTheme';
import type { MenuProps } from './types';

/**
 * iOS: a real pull-down menu (SwiftUI `Menu`) behind a circular glass button — the system draws the
 * menu, its blur, its haptics and its dismissal.
 */
export function Menu({ label, items, icon = 'more', disabled = false }: MenuProps) {
  const { scheme } = useTheme();
  return (
    <Host matchContents colorScheme={scheme}>
      <SwiftMenu
        label={label}
        systemImage={ICONS[icon].sf}
        modifiers={[buttonStyle('glass'), buttonBorderShape('circle'), labelStyle('iconOnly'), controlSize('large'), disabledModifier(disabled)]}
      >
        {items.map((entry, index) =>
          entry === 'divider' ? (
            <Divider key={`divider-${index}`} />
          ) : (
            <Button
              key={`${entry.label}-${index}`}
              label={entry.label}
              systemImage={entry.selected ? 'checkmark' : entry.icon ? ICONS[entry.icon].sf : undefined}
              role={entry.destructive ? 'destructive' : 'default'}
              onPress={entry.onPress}
              modifiers={[disabledModifier(entry.disabled ?? false)]}
            />
          ),
        )}
      </SwiftMenu>
    </Host>
  );
}
export type { MenuProps } from './types';
