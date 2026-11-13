import type { MaterialIcons } from '@expo/vector-icons';
import type { SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';

/**
 * One semantic name per icon, mapped to the platform-native glyph: an SF Symbol on iOS (via
 * `expo-symbols`, so icons follow the system's weight/scale) and a Material glyph elsewhere.
 * Add entries here when a task first needs an icon — not speculatively.
 *
 * (Type-only imports: this file is shared by `Icon.tsx` and `Icon.ios.tsx` and must not pull a
 * platform's icon runtime into the other.)
 */
interface IconDefinition {
  sf: SymbolViewProps['name'];
  md: ComponentProps<typeof MaterialIcons>['name'];
}

export const ICONS = {
  close: { sf: 'xmark', md: 'close' },
  chevronRight: { sf: 'chevron.right', md: 'chevron-right' },
  chevronLeft: { sf: 'chevron.left', md: 'chevron-left' },
  eye: { sf: 'eye', md: 'visibility' },
  eyeOff: { sf: 'eye.slash', md: 'visibility-off' },
  success: { sf: 'checkmark.circle.fill', md: 'check-circle' },
  error: { sf: 'exclamationmark.circle.fill', md: 'error' },
  warning: { sf: 'exclamationmark.triangle.fill', md: 'warning' },
  info: { sf: 'info.circle.fill', md: 'info' },
  person: { sf: 'person.fill', md: 'person' },
  settings: { sf: 'gearshape.fill', md: 'settings' },
  gear: { sf: 'gearshape', md: 'settings' },
  signOut: { sf: 'rectangle.portrait.and.arrow.right', md: 'logout' },
  gallery: { sf: 'square.grid.2x2.fill', md: 'grid-view' },
  offline: { sf: 'wifi.slash', md: 'wifi-off' },
  search: { sf: 'magnifyingglass', md: 'search' },
  clear: { sf: 'xmark.circle.fill', md: 'cancel' },
  check: { sf: 'checkmark', md: 'check' },
  more: { sf: 'ellipsis', md: 'more-horiz' },
  plus: { sf: 'plus', md: 'add' },
  minus: { sf: 'minus', md: 'remove' },
  camera: { sf: 'camera', md: 'photo-camera' },
  photo: { sf: 'photo', md: 'photo-library' },
  trash: { sf: 'trash', md: 'delete' },
  share: { sf: 'square.and.arrow.up', md: 'ios-share' },
  edit: { sf: 'pencil', md: 'edit' },
  bell: { sf: 'bell.fill', md: 'notifications' },
  // Feed & posts (Task 7)
  heart: { sf: 'heart', md: 'favorite-border' },
  comment: { sf: 'bubble.left', md: 'chat-bubble-outline' },
  // Flutter's "clone" glyph: two overlapping squares.
  repost: { sf: 'square.on.square', md: 'filter-none' },
  trip: { sf: 'safari.fill', md: 'explore' },
  tripStart: { sf: 'location.north.fill', md: 'near-me' },
  tripStop: { sf: 'mappin', md: 'location-on' },
  tripEnd: { sf: 'flag.fill', md: 'flag' },
  refresh: { sf: 'arrow.clockwise', md: 'refresh' },
  feed: { sf: 'newspaper', md: 'article' },
  brokenImage: { sf: 'photo', md: 'broken-image' },
  // Comments (Task 8)
  arrowUp: { sf: 'arrow.up', md: 'arrow-upward' },
  reply: { sf: 'arrowshape.turn.up.left', md: 'reply' },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  /** Any colour string. Defaults to the theme's text colour. */
  color?: string;
  /**
   * Accessible name. Omit for purely decorative icons (they are then hidden from VoiceOver /
   * TalkBack); icons that stand alone as a control must have a label.
   */
  label?: string;
}
