import { pickerPosition, pickerWidth, PICKER_HEIGHT } from './pickerPosition';

const window = { width: 390, height: 844 };
const anchor = { x: 20, y: 500, width: 60, height: 44 };

describe('pickerPosition', () => {
  it('sits just above the like button, nudged left of it', () => {
    const { left, top } = pickerPosition(anchor, window, 59);
    expect(left).toBe(16); // anchor.x - 10 = 10, kept 16 from the edge
    expect(top).toBe(anchor.y - PICKER_HEIGHT - 8);
  });

  it('is kept inside the right edge', () => {
    const { left } = pickerPosition({ ...anchor, x: 380 }, window, 59);
    expect(left + pickerWidth()).toBeLessThanOrEqual(window.width - 16);
  });

  it('flips below the button when there is no room above', () => {
    const { top } = pickerPosition({ ...anchor, y: 90 }, window, 59);
    expect(top).toBe(90 + 44 + 8);
  });

  it('never goes off the bottom of the screen', () => {
    const { top } = pickerPosition({ ...anchor, y: 40, height: 44 }, { width: 390, height: 100 }, 59);
    expect(top + PICKER_HEIGHT).toBeLessThanOrEqual(100 - 16 + 0.001);
  });
});
