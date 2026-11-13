import { resolveSheetBackground, sheetOptions } from './sheet';

const base = { detents: [0.5, 1] as number[], background: '#FFFFFF' };

describe('sheetOptions', () => {
  it('is a native form sheet with the grabber, drag-to-dismiss, and no native header', () => {
    const o = sheetOptions(base);
    expect(o.presentation).toBe('formSheet');
    expect(o.sheetGrabberVisible).toBe(true);
    expect(o.gestureEnabled).toBe(true);
    expect(o.headerShown).toBe(false);
  });

  it('applies the background it is given', () => {
    expect(sheetOptions({ ...base, background: 'transparent' }).contentStyle).toEqual({ backgroundColor: 'transparent' });
    expect(sheetOptions({ ...base, background: '#1C1C1E' }).contentStyle).toEqual({ backgroundColor: '#1C1C1E' });
  });

  it('passes detents through, including fitToContents', () => {
    expect(sheetOptions({ ...base, detents: [0.4, 0.8] }).sheetAllowedDetents).toEqual([0.4, 0.8]);
    expect(sheetOptions({ ...base, detents: 'fitToContents' }).sheetAllowedDetents).toBe('fitToContents');
  });

  it('opens at the first detent unless told otherwise', () => {
    expect(sheetOptions(base).sheetInitialDetentIndex).toBe(0);
    expect(sheetOptions({ ...base, initialDetent: 1 }).sheetInitialDetentIndex).toBe(1);
  });

  it('dims the page behind at every detent by default, and only un-dims when asked', () => {
    expect(sheetOptions(base)).not.toHaveProperty('sheetLargestUndimmedDetentIndex');
    expect(sheetOptions({ ...base, undimmedThrough: 0 }).sheetLargestUndimmedDetentIndex).toBe(0);
  });
});

// Regression guard for two opposite bugs seen on device:
//  - opaque background on iOS 26 hides the system's Liquid Glass sheet;
//  - transparent background on iOS 18 leaves the sheet see-through, with the page behind showing
//    through its text.
describe('resolveSheetBackground', () => {
  it('is transparent only where the system draws the sheet glass (iOS 26+)', () => {
    expect(resolveSheetBackground(true, '#FFFFFF')).toBe('transparent');
  });

  it.each(['#FFFFFF', '#1C1C1E'])('is the opaque surface (%s) everywhere else', (surface) => {
    expect(resolveSheetBackground(false, surface)).toBe(surface);
  });
});
