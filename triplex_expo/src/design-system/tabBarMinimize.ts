import { create } from 'zustand';

export type MinimizeBehavior = 'onScrollDown' | 'never';

/** Scroll distance (pt) in one direction before we react — filters jitter and tiny reversals. */
export const MINIMIZE_SCROLL_THRESHOLD = 14;

/**
 * Decides the tab bar's minimize behavior from a scroll delta (`current offset − previous offset`).
 *
 * Why this exists: on iOS 26.5, `minimizeBehavior="onScrollDown"` minimises the bar on scroll down
 * but it did **not** expand again on scroll up (not even at the very top; only tapping the pill
 * did). UIKit expands the bar when the behavior is set to `never`, so we flip it:
 *  - scrolling UP past the threshold  → `never` (bar expands)
 *  - scrolling DOWN past the threshold → `onScrollDown` (bar may minimise again)
 */
export function nextMinimizeBehavior(current: MinimizeBehavior, delta: number): MinimizeBehavior {
  if (delta <= -MINIMIZE_SCROLL_THRESHOLD) return 'never';
  if (delta >= MINIMIZE_SCROLL_THRESHOLD) return 'onScrollDown';
  return current;
}

export const useTabBarMinimize = create<{
  behavior: MinimizeBehavior;
  setBehavior: (b: MinimizeBehavior) => void;
}>((set, get) => ({
  behavior: 'onScrollDown',
  setBehavior: (behavior) => {
    if (get().behavior !== behavior) set({ behavior });
  },
}));
