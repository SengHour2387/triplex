import { fireEvent, render, screen } from '@testing-library/react-native';

import { MediaCarousel } from './MediaCarousel';

const urls = ['https://img/1.jpg', 'https://img/2.jpg', 'https://img/3.jpg'];
const WIDTH = 402;

/** Lay the carousel out at a known width, as the device would. */
async function renderCarousel(images: string[], onOpen = jest.fn(), inset?: number) {
  await render(<MediaCarousel images={images} onOpen={onOpen} inset={inset} />);
  await fireEvent(screen.getByTestId('media-carousel'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: WIDTH, height: 300 } } });
  return onOpen;
}

describe('MediaCarousel', () => {
  it('draws nothing without photos', async () => {
    await render(<MediaCarousel images={[]} onOpen={jest.fn()} />);
    expect(screen.toJSON()).toBeNull();
  });

  it('one photo: a wide card inset on both sides, no dots', async () => {
    const onOpen = await renderCarousel([urls[0]]);
    const photo = screen.getByRole('imagebutton', { name: 'Photo' });
    expect(photo.props.style).toMatchObject({ width: WIDTH - 32, borderRadius: 12 });
    expect(screen.queryByLabelText(/Page/)).toBeNull();
    await fireEvent.press(photo);
    expect(onOpen).toHaveBeenCalledWith(0);
  });

  it('several photos: portrait tiles that rest inset and leave the next one peeking in', async () => {
    await renderCarousel(urls);
    const tiles = screen.getAllByRole('imagebutton');
    expect(tiles).toHaveLength(3);
    const tileWidth = Math.round((WIDTH - 32) * 0.62);
    expect(tiles[0].props.style).toMatchObject({ width: tileWidth, borderRadius: 12 });
    expect(tiles[0].props.style.aspectRatio).toBeLessThan(1); // portrait
    // The row itself is as wide as the screen (so photos can slide to the edge) and padded by the inset.
    const row = screen.getByTestId('media-carousel-row');
    expect(row.props.contentContainerStyle).toMatchObject({ paddingHorizontal: 16 });
    expect(row.props.snapToInterval).toBe(tileWidth + 8);
    // At rest the next tile is partly visible: two tiles plus the gap are wider than the space they have.
    expect(16 + tileWidth + 8 + tileWidth).toBeGreaterThan(WIDTH);
  });

  it('opens the photo that was tapped', async () => {
    const onOpen = await renderCarousel(urls);
    await fireEvent.press(screen.getByRole('imagebutton', { name: 'Photo 2 of 3' }));
    expect(onOpen).toHaveBeenCalledWith(1);
  });

  it('moves the dots as it scrolls, and reaches the last dot at the end of the scroll range', async () => {
    await renderCarousel(urls);
    const row = screen.getByTestId('media-carousel-row');
    const step = Math.round((WIDTH - 32) * 0.62) + 8;
    const scrollTo = (x: number, contentWidth: number) =>
      fireEvent.scroll(row, { nativeEvent: { contentOffset: { x, y: 0 }, contentSize: { width: contentWidth, height: 300 }, layoutMeasurement: { width: WIDTH, height: 300 } } });
    expect(screen.getByLabelText('Page 1 of 3')).toBeTruthy();
    await scrollTo(step, 1000);
    expect(screen.getByLabelText('Page 2 of 3')).toBeTruthy();
    // 1000pt of content can only scroll to 598pt — short of the third tile's snap point (460 + …) — yet it is the last photo.
    await scrollTo(598, 1000);
    expect(screen.getByLabelText('Page 3 of 3')).toBeTruthy();
  });

  it('without an inset (inside the embedded card) it rests against the card edge', async () => {
    await renderCarousel(urls, jest.fn(), 0);
    const row = screen.getByTestId('media-carousel-row');
    expect(row.props.contentContainerStyle).toMatchObject({ paddingHorizontal: 0 });
  });
});
