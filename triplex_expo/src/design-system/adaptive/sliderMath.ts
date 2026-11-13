/** Geometry of the drawn slider, kept pure so it can be tested without a gesture. */

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Rounds to the step grid anchored at `min`, and trims float noise (0.1 + 0.2). */
export function snap(value: number, min: number, max: number, step?: number): number {
  const clamped = clamp(value, min, max);
  if (!step || step <= 0) return clamped;
  // (x / step) can land a hair under a tie (0.35 / 0.1 = 3.4999…), so trim the noise before rounding.
  const steps = Math.round(Number(((clamped - min) / step).toFixed(8)));
  const snapped = min + steps * step;
  return clamp(Number(snapped.toFixed(10)), min, max);
}

/**
 * The value at a touch position `x` (px from the track's left edge). The thumb's centre travels
 * between `thumbWidth / 2` and `trackWidth - thumbWidth / 2`, so the thumb never leaves the track.
 */
export function valueAt(x: number, trackWidth: number, thumbWidth: number, min: number, max: number, step?: number): number {
  const travel = trackWidth - thumbWidth;
  if (travel <= 0) return snap(min, min, max, step);
  const fraction = clamp((x - thumbWidth / 2) / travel, 0, 1);
  return snap(min + fraction * (max - min), min, max, step);
}

/** Left edge of the thumb for `value`. */
export function thumbLeft(value: number, trackWidth: number, thumbWidth: number, min: number, max: number): number {
  if (max <= min) return 0;
  const fraction = clamp((value - min) / (max - min), 0, 1);
  return fraction * Math.max(0, trackWidth - thumbWidth);
}

/** `value + delta`, clamped and snapped — one stepper press or one accessibility increment. */
export function stepBy(value: number, delta: number, min: number, max: number, step?: number): number {
  return snap(value + delta, min, max, step);
}
