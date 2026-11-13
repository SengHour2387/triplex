import { fadeOpacities } from './blurFade';

describe('fadeOpacities', () => {
  it('runs from fully opaque to fully transparent', () => {
    const o = fadeOpacities(14);
    expect(o[0]).toBe(1);
    expect(o[o.length - 1]).toBe(0);
    expect(o).toHaveLength(14);
  });

  it('never increases (no banding back up)', () => {
    const o = fadeOpacities(14);
    for (let i = 1; i < o.length; i++) expect(o[i]).toBeLessThanOrEqual(o[i - 1]);
  });

  it('is eased: holds more blur near the edge than a linear ramp would', () => {
    const eased = fadeOpacities(11, 1.6);
    const linear = fadeOpacities(11, 1);
    expect(eased[3]).toBeLessThan(linear[3]); // steeper start …
    expect(eased[0]).toBe(linear[0]);
  });

  it('rejects a degenerate fade', () => {
    expect(() => fadeOpacities(1)).toThrow();
  });
});
