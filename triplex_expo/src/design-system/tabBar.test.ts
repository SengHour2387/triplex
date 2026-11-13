import { contrastRatio } from './colorContrast';
import { resolveTabBarColors } from './tabBar';
import { colors, type ColorScheme } from './tokens';

const schemes: ColorScheme[] = ['light', 'dark'];

describe('resolveTabBarColors', () => {
  describe.each(schemes)('%s', (scheme) => {
    const c = colors[scheme];

    it('on iOS 26 only sets the selected tint, so the system glass keeps adapting', () => {
      expect(resolveTabBarColors(true, c)).toEqual({ tintColor: c.primary });
    });

    it('below iOS 26 colours the unselected items explicitly, with the secondary text colour', () => {
      const r = resolveTabBarColors(false, c);
      expect(r.tintColor).toBe(c.primary);
      expect(r.iconColor).toEqual({ default: c.textSecondary, selected: c.primary });
      expect(r.labelStyle).toEqual({
        default: { color: c.textSecondary },
        selected: { color: c.primary },
      });
    });

    // The reason the override exists. Against the opaque surfaces the bar sits over, unselected
    // items must clear WCAG AA (the system default measured 2.4:1 labels / 2.9:1 icons).
    it.each([
      ['canvas', c.background],
      ['surface', c.surface],
    ])('unselected items are legible over the %s', (_name, bar) => {
      const r = resolveTabBarColors(false, c);
      expect(contrastRatio(r.labelStyle!.default.color, bar)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(r.iconColor!.default, bar)).toBeGreaterThanOrEqual(3);
    });
  });

  it("the system's default unselected grey is below AA on a light bar (why this exists)", () => {
    // Measured from an iOS 18.5 screenshot: label ink ≈ (165,166,165) on a (252,253,251) bar.
    expect(contrastRatio('#A5A6A5', '#FCFDFB')).toBeLessThan(4.5);
    expect(contrastRatio('#969796', '#FCFDFB')).toBeLessThan(3.1);
  });
});
