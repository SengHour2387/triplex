/**
 * The geometry of the full-screen image viewer, kept free of React and gestures so it can be tested.
 * Every function is a worklet: the gesture callbacks run on the UI thread and call these directly.
 *
 * Coordinates: the page is `width × height`, the picture is fitted inside it ("contain") and scaled
 * about the page centre. `translate` is the offset of that centre; focal points are measured from it.
 */
export interface Size {
  width: number;
  height: number;
}

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
/** Where a double tap zooms to. */
export const DOUBLE_TAP_SCALE = 2.5;
/** Above this the picture counts as "zoomed": the pager stops scrolling and a drag pans the picture. */
export const ZOOMED_THRESHOLD = 1.02;
/** Dragging down/up further than this (pt), or flicking faster than `DISMISS_VELOCITY` (pt/s), closes the viewer. */
export const DISMISS_DISTANCE = 100;
export const DISMISS_VELOCITY = 500;

export function clampNumber(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/** The size a picture takes up when fitted inside `container` without cropping. */
export function fitSize(natural: Size, container: Size): Size {
  'worklet';
  if (natural.width <= 0 || natural.height <= 0) return container;
  const ratio = Math.min(container.width / natural.width, container.height / natural.height);
  return { width: natural.width * ratio, height: natural.height * ratio };
}

/** How far the picture may be dragged from the centre at `scale` before its edge leaves the screen. */
export function maxTranslate(scale: number, fitted: Size, container: Size): { x: number; y: number } {
  'worklet';
  return {
    x: Math.max(0, (fitted.width * scale - container.width) / 2),
    y: Math.max(0, (fitted.height * scale - container.height) / 2),
  };
}

/**
 * Pinch: the translation that keeps the picture point which started under the fingers (`startFocal`)
 * under the fingers as they move to `focal` — so it zooms *into the fingers*, not the centre, and
 * dragging while pinching pans. `startScale`/`startTranslate` are the values when the pinch began.
 */
export function pinchTranslate(args: { scale: number; startScale: number; startTranslate: number; startFocal: number; focal: number }): number {
  'worklet';
  const ratio = args.scale / args.startScale;
  return args.focal - ratio * (args.startFocal - args.startTranslate);
}

/**
 * Double tap: zoom out to fit if zoomed in, otherwise zoom to `DOUBLE_TAP_SCALE` about the tapped point
 * (so the thing you tapped stays under your finger), kept inside the picture's bounds.
 */
export function doubleTapTarget(args: { scale: number; tap: { x: number; y: number }; fitted: Size; container: Size }): { scale: number; x: number; y: number } {
  'worklet';
  if (args.scale > ZOOMED_THRESHOLD) return { scale: MIN_SCALE, x: 0, y: 0 };
  const scale = DOUBLE_TAP_SCALE;
  const max = maxTranslate(scale, args.fitted, args.container);
  const fx = args.tap.x - args.container.width / 2;
  const fy = args.tap.y - args.container.height / 2;
  return { scale, x: clampNumber(fx * (1 - scale), -max.x, max.x), y: clampNumber(fy * (1 - scale), -max.y, max.y) };
}

export function shouldDismiss(translationY: number, velocityY: number): boolean {
  'worklet';
  return Math.abs(translationY) > DISMISS_DISTANCE || Math.abs(velocityY) > DISMISS_VELOCITY;
}

/** 0 → 1 as the picture is dragged away; drives the backdrop fading and the picture shrinking. */
export function dismissProgress(translationY: number, height: number): number {
  'worklet';
  return clampNumber(Math.abs(translationY) / (height * 0.5), 0, 1);
}

/** The page the pager is on, from its horizontal scroll offset. */
export function pageIndex(offsetX: number, pageWidth: number, count: number): number {
  return clampNumber(Math.round(offsetX / Math.max(pageWidth, 1)), 0, Math.max(count - 1, 0));
}
