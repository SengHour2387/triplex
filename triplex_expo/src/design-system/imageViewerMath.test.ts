import { doubleTapTarget, dismissProgress, DOUBLE_TAP_SCALE, fitSize, maxTranslate, pageIndex, pinchTranslate, shouldDismiss } from './imageViewerMath';

const screen = { width: 400, height: 800 };

describe('fitSize', () => {
  it('fits a wide picture to the width and a tall one to the height', () => {
    expect(fitSize({ width: 2000, height: 1000 }, screen)).toEqual({ width: 400, height: 200 });
    expect(fitSize({ width: 1000, height: 4000 }, screen)).toEqual({ width: 200, height: 800 });
  });

  it('uses the whole page until the picture size is known', () => {
    expect(fitSize({ width: 0, height: 0 }, screen)).toEqual(screen);
  });
});

describe('maxTranslate', () => {
  it('allows no panning until the picture is bigger than the screen', () => {
    const fitted = { width: 400, height: 200 };
    expect(maxTranslate(1, fitted, screen)).toEqual({ x: 0, y: 0 });
    // A wide picture zoomed 2×: 800 wide (400 beyond the screen) but only 400 tall (still inside 800).
    expect(maxTranslate(2, fitted, screen)).toEqual({ x: 200, y: 0 });
    expect(maxTranslate(4, fitted, screen)).toEqual({ x: 600, y: 0 });
  });
});

describe('pinchTranslate', () => {
  it('keeps the point under the fingers fixed while zooming', () => {
    // Fingers 100pt right of centre, picture not yet moved. After zooming 2× the picture must have
    // shifted left by 100 so that point is still under the fingers.
    expect(pinchTranslate({ scale: 2, startScale: 1, startTranslate: 0, startFocal: 100, focal: 100 })).toBe(-100);
  });

  it('pans along when the fingers move while pinching', () => {
    expect(pinchTranslate({ scale: 2, startScale: 1, startTranslate: 0, startFocal: 100, focal: 130 })).toBe(-70);
  });

  it('does nothing at the centre', () => {
    expect(pinchTranslate({ scale: 3, startScale: 1, startTranslate: 0, startFocal: 0, focal: 0 })).toBeCloseTo(0);
  });
});

describe('doubleTapTarget', () => {
  const fitted = { width: 400, height: 800 };

  it('zooms in about the tapped point', () => {
    const target = doubleTapTarget({ scale: 1, tap: { x: 300, y: 400 }, fitted, container: screen });
    expect(target.scale).toBe(DOUBLE_TAP_SCALE);
    expect(target.x).toBeCloseTo(-150); // tapped 100 right of centre → picture moves left by 100 × 1.5
    expect(target.y).toBeCloseTo(0);
  });

  it('never pans past the picture edge', () => {
    const target = doubleTapTarget({ scale: 1, tap: { x: 400, y: 0 }, fitted, container: screen });
    const max = maxTranslate(DOUBLE_TAP_SCALE, fitted, screen);
    expect(Math.abs(target.x)).toBeLessThanOrEqual(max.x);
    expect(Math.abs(target.y)).toBeLessThanOrEqual(max.y);
  });

  it('zooms back out to fit when already zoomed', () => {
    expect(doubleTapTarget({ scale: 2.5, tap: { x: 10, y: 10 }, fitted, container: screen })).toEqual({ scale: 1, x: 0, y: 0 });
  });
});

describe('dismiss', () => {
  it('closes after a long drag or a fast flick, in either direction', () => {
    expect(shouldDismiss(140, 0)).toBe(true);
    expect(shouldDismiss(-140, 0)).toBe(true);
    expect(shouldDismiss(30, 900)).toBe(true);
    expect(shouldDismiss(30, -900)).toBe(true);
  });

  it('springs back after a small slow drag', () => {
    expect(shouldDismiss(60, 200)).toBe(false);
  });

  it('measures progress from 0 to 1', () => {
    expect(dismissProgress(0, 800)).toBe(0);
    expect(dismissProgress(200, 800)).toBe(0.5);
    expect(dismissProgress(-1000, 800)).toBe(1);
  });
});

describe('pageIndex', () => {
  it('rounds the scroll offset to a page and stays in range', () => {
    expect(pageIndex(0, 400, 3)).toBe(0);
    expect(pageIndex(410, 400, 3)).toBe(1);
    expect(pageIndex(2000, 400, 3)).toBe(2);
    expect(pageIndex(-50, 400, 3)).toBe(0);
  });
});
