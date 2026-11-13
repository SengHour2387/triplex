import { resolveSurfaceMode } from './glassTier';

describe('resolveSurfaceMode', () => {
  it.each([
    // os, liquidGlassAvailable, reduceTransparency, expected
    ['ios', true, false, 'liquid'],
    ['ios', false, false, 'blur'],
    ['android', false, false, 'frosted'],
    // A device can't report liquid glass on Android, but if it ever did we still must not use it:
    ['android', true, false, 'frosted'],
    ['web', false, false, 'frosted'],
  ] as const)('%s, liquid=%s, reduceTransparency=%s → %s', (os, liquidGlassAvailable, reduceTransparency, expected) => {
    expect(resolveSurfaceMode({ os, liquidGlassAvailable, reduceTransparency })).toBe(expected);
  });

  it.each(['ios', 'android'])('reduce transparency forces an opaque surface on %s', (os) => {
    expect(resolveSurfaceMode({ os, liquidGlassAvailable: true, reduceTransparency: true })).toBe('solid');
    expect(resolveSurfaceMode({ os, liquidGlassAvailable: false, reduceTransparency: true })).toBe('solid');
  });
});
