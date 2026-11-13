import { REACTIONS } from './reactions';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PICKER_HEIGHT = 56;
const BUTTON_WIDTH = 40;
const PICKER_PADDING = 8;
const GAP = 8;
const MARGIN = 16;

export const pickerWidth = (): number => REACTIONS.length * BUTTON_WIDTH + PICKER_PADDING * 2;

/**
 * Where the reaction bar goes: just above the like button, left-aligned with it but kept `MARGIN` away
 * from the screen edges — and *below* the button when there is no room above (a card scrolled to the
 * top, under the status bar).
 */
export function pickerPosition(anchor: Rect, window: { width: number; height: number }, topInset: number): { left: number; top: number } {
  const width = pickerWidth();
  const left = Math.min(Math.max(anchor.x - 10, MARGIN), Math.max(window.width - width - MARGIN, MARGIN));
  const above = anchor.y - PICKER_HEIGHT - GAP;
  const below = anchor.y + anchor.height + GAP;
  const top = above >= topInset + MARGIN ? above : Math.min(below, window.height - PICKER_HEIGHT - MARGIN);
  return { left, top };
}
