export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Placement {
  left: number;
  top: number;
  /** Where the menu grows from, so it appears to unfold out of its button. */
  origin: 'top left' | 'top right' | 'bottom left' | 'bottom right';
}

export interface PlacementInput {
  anchor: Rect;
  menu: { width: number; height: number };
  window: { width: number; height: number };
  /** System bars the menu must stay clear of. */
  insets: { top: number; bottom: number };
  /** Gap kept between the menu and the screen edge / the anchor. */
  margin?: number;
}

/**
 * Where to put a pull-down menu: under its button, aligned to the button's nearer screen edge
 * (right-aligned when the button is in the right half, as iOS does), flipped above the button when
 * there is no room below, and always kept inside the screen.
 */
export function placeMenu({ anchor, menu, window, insets, margin = 8 }: PlacementInput): Placement {
  const anchorCentre = anchor.x + anchor.width / 2;
  const alignRight = anchorCentre > window.width / 2;

  const idealLeft = alignRight ? anchor.x + anchor.width - menu.width : anchor.x;
  const left = Math.min(Math.max(idealLeft, margin), Math.max(margin, window.width - menu.width - margin));

  const below = anchor.y + anchor.height + margin;
  const roomBelow = window.height - insets.bottom - margin - below;
  const fitsBelow = menu.height <= roomBelow;
  const above = anchor.y - margin - menu.height;
  const fitsAbove = above >= insets.top + margin;

  const flip = !fitsBelow && fitsAbove;
  const rawTop = flip ? above : below;
  const top = Math.min(Math.max(rawTop, insets.top + margin), Math.max(insets.top + margin, window.height - insets.bottom - margin - menu.height));

  return { left, top, origin: `${flip ? 'bottom' : 'top'} ${alignRight ? 'right' : 'left'}` };
}
