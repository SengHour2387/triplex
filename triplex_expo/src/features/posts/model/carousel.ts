/**
 * The page a snapping carousel is on, from its scroll offset. `step` is one page (a tile plus the gap).
 *
 * The last tile usually can't scroll all the way to the start edge — the list runs out of content first —
 * so near the end of the scroll range the answer is always the last page; otherwise the dot would stay on
 * the second-to-last page while the last photo is fully on screen.
 */
export function pageIndexFor(offsetX: number, step: number, count: number, maxOffset?: number): number {
  if (step <= 0 || count <= 0) return 0;
  if (maxOffset !== undefined && maxOffset > 0 && offsetX >= maxOffset - step * 0.3) return count - 1;
  return Math.min(Math.max(Math.round(offsetX / step), 0), count - 1);
}
