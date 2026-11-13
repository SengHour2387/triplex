/**
 * Options for a native bottom sheet — the iOS `UISheetPresentationController` via a `formSheet`
 * route (Expo Router / react-native-screens). Use through `useSheetOptions()`.
 *
 * Why this is "the way Apple does it": the sheet is a *real* native sheet, not a drawn imitation —
 * so on iOS 26 the system gives it the Liquid Glass background, the floating inset, concentric
 * corners, the grabber and the drag/dismiss physics for free.
 *
 * The one subtlety is the screen **background**, which depends on who draws the sheet material:
 *
 *  - iOS 26+  → the *system* draws the glass. The screen must be **transparent** or it covers it.
 *  - iOS < 26 (and Android) → *nothing* draws a material. A transparent screen would leave the
 *    sheet see-through, with the page behind showing through its text (found on iOS 18.5). The
 *    screen must paint its own opaque surface.
 *
 * Content rules: use a plain container, never `Screen` (it paints an opaque background); leave
 * room for the bottom safe area.
 */
export interface SheetOptionsInput {
  /**
   * Heights the sheet can rest at, as fractions of the screen (0–1), or `'fitToContents'` (the
   * content then needs an explicit height — `flex: 1` is not supported with it).
   */
  detents: number[] | 'fitToContents';
  /** Which detent it opens at. Defaults to the first. */
  initialDetent?: number;
  /** Largest detent index at which the content behind is *not* dimmed (maps-style sheets). */
  undimmedThrough?: number;
  /** The screen background — from `resolveSheetBackground`. */
  background: string;
}

/** `'transparent'` only when the system draws the sheet glass (iOS 26+); else the opaque surface. */
export function resolveSheetBackground(systemDrawsSheetGlass: boolean, opaqueSurface: string): string {
  return systemDrawsSheetGlass ? 'transparent' : opaqueSurface;
}

export function sheetOptions({ detents, initialDetent = 0, undimmedThrough, background }: SheetOptionsInput) {
  return {
    presentation: 'formSheet' as const,
    // A sheet draws its own header (see SheetHeader); native headers don't render in form sheets.
    headerShown: false,
    gestureEnabled: true,
    sheetGrabberVisible: true,
    sheetAllowedDetents: detents,
    sheetInitialDetentIndex: initialDetent,
    sheetExpandsWhenScrolledToEdge: true,
    ...(undimmedThrough === undefined ? null : { sheetLargestUndimmedDetentIndex: undimmedThrough }),
    contentStyle: { backgroundColor: background },
  };
}
