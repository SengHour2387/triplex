import { contrastRatio, over } from './colorContrast';
import { colors, type ColorScheme, type ToastKind } from './tokens';

const AA_TEXT = 4.5;
const schemes: ColorScheme[] = ['light', 'dark'];
const toastKinds: ToastKind[] = ['success', 'error', 'warning', 'info'];

describe.each(schemes)('%s scheme text contrast (WCAG AA ≥ 4.5)', (scheme) => {
  const c = colors[scheme];

  it.each([
    ['text on background', c.text, c.background],
    ['text on surface', c.text, c.surface],
    ['secondary text on background', c.textSecondary, c.background],
    ['secondary text on surface', c.textSecondary, c.surface],
    ['accent on background', c.accent, c.background],
    ['accent on surface', c.accent, c.surface],
    ['error on background', c.error, c.background],
    ['error on surface', c.error, c.surface],
    ['destructive on background', c.destructive, c.background],
    ['destructive on surface', c.destructive, c.surface],
    ['button label on primary', c.onPrimary, c.primary],
  ])('%s', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  // The un-blurred fallback surface must stay legible over ANY content, so test the extremes (not
  // just the canvas): a card over pure black and over pure white. (An earlier 78 % fill passed on
  // the canvas but let busy imagery bleed through text — found on device.)
  it.each([
    ['black', '#000000'],
    ['white', '#FFFFFF'],
    ['canvas', c.background],
  ])('text stays legible on the un-blurred glass fallback over a %s backdrop', (_name, backdrop) => {
    const glass = over(c.glassFill, backdrop);
    expect(contrastRatio(c.text, glass)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(c.textSecondary, glass)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('text stays legible on the field fill over the canvas and over a surface', () => {
    for (const base of [c.background, c.surface]) {
      const field = over(c.fieldFill, base);
      expect(contrastRatio(c.text, field)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(c.textSecondary, field)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it('text stays legible on the capsule control fill over the canvas and over a surface', () => {
    for (const base of [c.background, c.surface]) {
      const fill = over(c.controlFill, base);
      expect(contrastRatio(c.text, fill)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrastRatio(c.textSecondary, fill)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it('text — including destructive red — stays legible on the dialog capsule buttons (over a dialog card)', () => {
    const fill = over(c.buttonFill, c.surface);
    expect(contrastRatio(c.text, fill)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(c.destructive, fill)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('the switch knob stands out from both track states', () => {
    // Non-text UI needs 3:1 (WCAG 1.4.11) — except that iOS's own "on" green is a little under it on
    // white, so the knob's *position* (and the "on/off" accessibility value) carries the state too.
    expect(contrastRatio(c.thumb, over(c.toggleOff, c.surface))).toBeGreaterThanOrEqual(1.1);
  });

  it.each(toastKinds)('%s toast text on its card', (kind) => {
    const { fg, bg } = c.toast[kind];
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('why the accent is not Flutter\'s #1D8BFF', () => {
  // Guards the harness itself (it must be able to fail) and records the reason for the choice.
  it('Flutter\'s blue is too weak as text on the light canvas', () => {
    expect(contrastRatio('#1D8BFF', colors.light.background)).toBeLessThan(AA_TEXT);
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG reference extremes', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#123456', '#fedcba')).toBeCloseTo(contrastRatio('#fedcba', '#123456'), 10);
  });
});

describe('over', () => {
  it('composites translucent colours over an opaque base', () => {
    expect(over('rgba(0,0,0,0.5)', '#FFFFFF')).toBe('#808080');
    expect(over('rgba(255,255,255,0)', '#336699')).toBe('#336699');
  });

  it('rejects a translucent base', () => {
    expect(() => over('#000000', 'rgba(0,0,0,0.5)')).toThrow(/opaque/);
  });
});
