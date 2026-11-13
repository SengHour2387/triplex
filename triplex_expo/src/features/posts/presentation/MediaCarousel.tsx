import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { PageDots, RemoteImage, spacing } from '../../../design-system';
import { pageIndexFor } from '../model/carousel';

export interface MediaCarouselProps {
  images: readonly string[];
  /** Tapping a photo opens the full-screen viewer at that photo. */
  onOpen: (index: number) => void;
  /**
   * Space between the screen edge and the first photo. The photos rest inset by this much and slide out
   * to the very edge only while scrolling (so give the carousel the full width and let it bleed).
   */
  inset?: number;
  radius?: number;
}

/** Photos are a touch rounder than a button, far less than a card (Threads ≈ 12). */
export const PHOTO_RADIUS = 12;
/** One photo: a wide card. Several: portrait tiles (6:7), so the next one always peeks in. */
const SINGLE_ASPECT = 16 / 10;
const TILE_ASPECT = 6 / 7;
const TILE_FRACTION = 0.62;
const GAP = spacing.sm;

/**
 * A post's photos. One photo is a plain wide card. Several are a snapping row of portrait tiles that rests
 * inset (aligned with the text) and slides to the screen edge as it scrolls, with the next tile peeking in
 * and a dot indicator under it.
 */
export function MediaCarousel({ images, onOpen, inset = spacing.lg, radius = PHOTO_RADIUS }: MediaCarouselProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => setWidth(Math.round(event.nativeEvent.layout.width)), []);
  const content = width - inset * 2;
  const tileWidth = Math.round(content * TILE_FRACTION);
  const step = tileWidth + GAP;

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const next = pageIndexFor(contentOffset.x, step, images.length, contentSize.width - layoutMeasurement.width);
      setIndex((current) => (current === next ? current : next));
    },
    [step, images.length],
  );

  if (images.length === 0) return null;

  const photo = (url: string, i: number, w: number, aspect: number) => (
    <Pressable
      key={`${i}-${url}`}
      accessibilityRole="imagebutton"
      accessibilityLabel={images.length > 1 ? `Photo ${i + 1} of ${images.length}` : 'Photo'}
      accessibilityHint="Opens the photo full screen"
      onPress={() => onOpen(i)}
      style={{ width: w, aspectRatio: aspect, borderRadius: radius, borderCurve: 'continuous', overflow: 'hidden' }}
    >
      <RemoteImage uri={url} recyclingKey={url} style={styles.fill} />
    </Pressable>
  );

  return (
    <View testID="media-carousel" onLayout={onLayout} style={styles.root}>
      {width === 0 ? (
        // Until the width is known, reserve the height so the list doesn't jump.
        <View style={{ aspectRatio: images.length === 1 ? SINGLE_ASPECT : content / (tileWidth / TILE_ASPECT), marginHorizontal: inset }} />
      ) : images.length === 1 ? (
        <View style={{ paddingHorizontal: inset }}>{photo(images[0], 0, content, SINGLE_ASPECT)}</View>
      ) : (
        <>
          <ScrollView
            testID="media-carousel-row"
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={step}
            snapToAlignment="start"
            disableIntervalMomentum
            scrollEventThrottle={32}
            onScroll={onScroll}
            contentContainerStyle={{ paddingHorizontal: inset, gap: GAP }}
          >
            {images.map((url, i) => photo(url, i, tileWidth, TILE_ASPECT))}
          </ScrollView>
          <View style={styles.dots}>
            <PageDots count={images.length} index={index} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'stretch' },
  fill: { width: '100%', height: '100%' },
  dots: { paddingTop: spacing.sm },
});
