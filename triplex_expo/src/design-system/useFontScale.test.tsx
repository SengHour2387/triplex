import { render, screen } from '@testing-library/react-native';
import { Dimensions, StyleSheet } from 'react-native';

import { Text } from './Text';
import { MAX_FONT_SCALE } from './tokens';
import { clampFontScale } from './useFontScale';

describe('clampFontScale', () => {
  it('never shrinks below 1 and never exceeds the layout cap', () => {
    expect(clampFontScale(0.8)).toBe(1);
    expect(clampFontScale(1)).toBe(1);
    expect(clampFontScale(1.3)).toBe(1.3);
    expect(clampFontScale(3.1)).toBe(MAX_FONT_SCALE); // accessibility XXXL
  });
});

describe('Text line height tracks the system text size', () => {
  const lineHeightAt = async (fontScale: number) => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale });
    await render(<Text testID="t" variant="body">hello</Text>);
    const { lineHeight } = StyleSheet.flatten(screen.getByTestId('t').props.style);
    screen.unmount();
    return lineHeight;
  };

  afterEach(() => jest.restoreAllMocks());

  it('is the token value at normal size', async () => expect(await lineHeightAt(1)).toBe(22));
  it('grows with the font scale', async () => expect(await lineHeightAt(1.5)).toBe(33));
  it('stops at the layout cap', async () => expect(await lineHeightAt(3)).toBe(Math.round(22 * MAX_FONT_SCALE)));
});
