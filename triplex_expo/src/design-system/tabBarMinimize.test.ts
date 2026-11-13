import { MINIMIZE_SCROLL_THRESHOLD as T, nextMinimizeBehavior } from './tabBarMinimize';

describe('nextMinimizeBehavior', () => {
  it('expands (never) once the user has scrolled up past the threshold', () => {
    expect(nextMinimizeBehavior('onScrollDown', -T)).toBe('never');
    expect(nextMinimizeBehavior('onScrollDown', -200)).toBe('never');
  });

  it('re-arms minimise once the user scrolls down past the threshold', () => {
    expect(nextMinimizeBehavior('never', T)).toBe('onScrollDown');
    expect(nextMinimizeBehavior('never', 200)).toBe('onScrollDown');
  });

  it('ignores small movements (jitter) in either state', () => {
    for (const d of [0, 1, -1, T - 1, -(T - 1)]) {
      expect(nextMinimizeBehavior('onScrollDown', d)).toBe('onScrollDown');
      expect(nextMinimizeBehavior('never', d)).toBe('never');
    }
  });
});
