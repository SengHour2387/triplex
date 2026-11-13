import { BlurView } from 'expo-blur';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Glass } from './Glass';
import { Icon } from './Icon';
import { RemoteImage } from './RemoteImage';
import { Text } from './Text';
import { spacing } from './tokens';
import {
  clampNumber,
  dismissProgress,
  doubleTapTarget,
  fitSize,
  MAX_SCALE,
  MIN_SCALE,
  maxTranslate,
  pageIndex,
  pinchTranslate,
  shouldDismiss,
  ZOOMED_THRESHOLD,
  type Size,
} from './imageViewerMath';

export interface ImageViewerProps {
  urls: readonly string[];
  initialIndex?: number;
  onClose: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

/**
 * Full-screen photo viewer: swipe between photos, pinch or double-tap to zoom, drag a photo down (or
 * up) to dismiss over a blurred backdrop that clears as you drag. Reduce Motion turns the animations
 * into instant changes. VoiceOver gets a Close button, "Photo n of m", a Zoom action, and the
 * two-finger-scrub escape gesture.
 *
 * Presented by `app/image-viewer.tsx` as a transparent modal route, so the screen behind it is what
 * the backdrop blurs.
 */
export function ImageViewer({ urls, initialIndex = 0, onClose }: ImageViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const start = clampNumber(initialIndex, 0, Math.max(urls.length - 1, 0));
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  const dragY = useSharedValue(0);
  const listRef = useRef<FlatList<string>>(null);

  const progress = useAnimatedStyle(() => ({ opacity: 1 - dismissProgress(dragY.get(), height) * 1.5 }));
  const backdropTint = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - dismissProgress(dragY.get(), height) * 1.4) }));
  const blurProps = useAnimatedProps(() => ({ intensity: 60 * (1 - dismissProgress(dragY.get(), height)) }));

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(pageIndex(event.nativeEvent.contentOffset.x, width, urls.length)),
    [width, urls.length],
  );

  return (
    <GestureHandlerRootView testID="image-viewer" style={styles.fill} accessibilityViewIsModal onAccessibilityEscape={onClose}>
      <AnimatedBlurView tint="dark" animatedProps={blurProps} style={StyleSheet.absoluteFill} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.tint, backdropTint]} />

      <FlatList
        ref={listRef}
        data={urls as string[]}
        keyExtractor={(url, i) => `${i}-${url}`}
        horizontal
        pagingEnabled
        scrollEnabled={!zoomed}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={start}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        windowSize={3}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item, index: i }) => (
          <ViewerPage uri={item} label={`Photo ${i + 1} of ${urls.length}`} size={{ width, height }} dragY={dragY} reduceMotion={reduceMotion} onZoomChange={setZoomed} onClose={onClose} />
        )}
      />

      <Animated.View pointerEvents="box-none" style={[styles.chrome, { paddingTop: insets.top + spacing.sm }, progress]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
          <Glass interactive radius="pill" style={styles.close}>
            <Icon name="close" size={18} />
          </Glass>
        </Pressable>
        {urls.length > 1 ? (
          // Redundant for screen readers: the focused photo already says "Photo n of m".
          <Glass radius="pill" style={styles.counter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text variant="subhead" weight="600">
              {index + 1} / {urls.length}
            </Text>
          </Glass>
        ) : null}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

interface ViewerPageProps {
  uri: string;
  label: string;
  size: Size;
  dragY: SharedValue<number>;
  reduceMotion: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onClose: () => void;
}

/** One photo: pinch / pan / double-tap while zoomed, drag-to-dismiss while not. */
function ViewerPage({ uri, label, size, dragY, reduceMotion, onZoomChange, onClose }: ViewerPageProps) {
  const { width, height } = size;
  const scale = useSharedValue(MIN_SCALE);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const startScale = useSharedValue(MIN_SCALE);
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startFocalX = useSharedValue(0);
  const startFocalY = useSharedValue(0);
  const fittedW = useSharedValue(width);
  const fittedH = useSharedValue(height);
  const [zoomed, setZoomed] = useState(false);
  const zoomedValue = useSharedValue(false);

  const syncZoomed = useCallback(
    (value: boolean) => {
      setZoomed(value);
      onZoomChange(value);
    },
    [onZoomChange],
  );

  const gesture = useMemo(() => {
    const bounds = (s: number) => {
      'worklet';
      return maxTranslate(s, { width: fittedW.get(), height: fittedH.get() }, { width, height });
    };
    const markZoomed = (s: number) => {
      'worklet';
      const next = s > ZOOMED_THRESHOLD;
      if (next !== zoomedValue.get()) {
        zoomedValue.set(next);
        scheduleOnRN(syncZoomed, next);
      }
    };
    const animate = (value: number) => {
      'worklet';
      return reduceMotion ? value : withTiming(value, { duration: 220 });
    };

    const pinch = Gesture.Pinch()
      .onStart((e) => {
        'worklet';
        startScale.set(scale.get());
        startTx.set(tx.get());
        startTy.set(ty.get());
        startFocalX.set(e.focalX - width / 2);
        startFocalY.set(e.focalY - height / 2);
      })
      .onUpdate((e) => {
        'worklet';
        const next = clampNumber(startScale.get() * e.scale, MIN_SCALE, MAX_SCALE);
        const max = bounds(next);
        scale.set(next);
        tx.set(clampNumber(pinchTranslate({ scale: next, startScale: startScale.get(), startTranslate: startTx.get(), startFocal: startFocalX.get(), focal: e.focalX - width / 2 }), -max.x, max.x));
        ty.set(clampNumber(pinchTranslate({ scale: next, startScale: startScale.get(), startTranslate: startTy.get(), startFocal: startFocalY.get(), focal: e.focalY - height / 2 }), -max.y, max.y));
        markZoomed(next);
      })
      .onEnd(() => {
        'worklet';
        if (scale.get() <= ZOOMED_THRESHOLD) {
          scale.set(animate(MIN_SCALE));
          tx.set(animate(0));
          ty.set(animate(0));
          markZoomed(MIN_SCALE);
        }
      });

    // Panning the zoomed photo. Only while zoomed: otherwise a horizontal drag must reach the pager.
    const pan = Gesture.Pan()
      .enabled(zoomed)
      .maxPointers(1)
      .onStart(() => {
        'worklet';
        startTx.set(tx.get());
        startTy.set(ty.get());
      })
      .onUpdate((e) => {
        'worklet';
        const max = bounds(scale.get());
        tx.set(clampNumber(startTx.get() + e.translationX, -max.x, max.x));
        ty.set(clampNumber(startTy.get() + e.translationY, -max.y, max.y));
      })
      .onEnd((e) => {
        'worklet';
        const max = bounds(scale.get());
        tx.set(withDecay({ velocity: e.velocityX, clamp: [-max.x, max.x] }));
        ty.set(withDecay({ velocity: e.velocityY, clamp: [-max.y, max.y] }));
      });

    // Drag down / up to dismiss. Only while not zoomed, and only for mostly-vertical drags so a
    // horizontal swipe still turns the page.
    const dismiss = Gesture.Pan()
      .enabled(!zoomed)
      .maxPointers(1)
      .activeOffsetY([-14, 14])
      .failOffsetX([-14, 14])
      .onUpdate((e) => {
        'worklet';
        dragY.set(e.translationY);
      })
      .onEnd((e) => {
        'worklet';
        if (shouldDismiss(e.translationY, e.velocityY)) {
          if (reduceMotion) {
            scheduleOnRN(onClose);
          } else {
            dragY.set(
              withTiming(Math.sign(e.translationY || 1) * height, { duration: 180 }, (finished) => {
                if (finished) scheduleOnRN(onClose);
              }),
            );
          }
        } else {
          dragY.set(reduceMotion ? 0 : withSpring(0, { damping: 20, stiffness: 220 }));
        }
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(250)
      .onEnd((e, success) => {
        'worklet';
        if (!success) return;
        const target = doubleTapTarget({ scale: scale.get(), tap: { x: e.x, y: e.y }, fitted: { width: fittedW.get(), height: fittedH.get() }, container: { width, height } });
        scale.set(animate(target.scale));
        tx.set(animate(target.x));
        ty.set(animate(target.y));
        markZoomed(target.scale);
      });

    return Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan, dismiss));
  }, [zoomed, width, height, reduceMotion, dragY, scale, tx, ty, startScale, startTx, startTy, startFocalX, startFocalY, fittedW, fittedH, zoomedValue, syncZoomed, onClose]);

  const style = useAnimatedStyle(() => {
    const away = dismissProgress(dragY.get(), height);
    return {
      transform: [
        { translateX: tx.get() },
        { translateY: ty.get() + dragY.get() },
        { scale: scale.get() * interpolate(away, [0, 1], [1, 0.65]) },
      ],
    };
  });

  const toggleZoom = useCallback(() => {
    const target = doubleTapTarget({ scale: scale.get(), tap: { x: width / 2, y: height / 2 }, fitted: { width: fittedW.get(), height: fittedH.get() }, container: { width, height } });
    scale.set(target.scale);
    tx.set(target.x);
    ty.set(target.y);
    zoomedValue.set(target.scale > ZOOMED_THRESHOLD);
    syncZoomed(target.scale > ZOOMED_THRESHOLD);
  }, [scale, tx, ty, fittedW, fittedH, zoomedValue, syncZoomed, width, height]);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{ width, height }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        accessibilityActions={[{ name: 'activate', label: 'Zoom in or out' }]}
        onAccessibilityAction={(event) => event.nativeEvent.actionName === 'activate' && toggleZoom()}
      >
        <Animated.View style={[StyleSheet.absoluteFill, style]}>
          <RemoteImage
            uri={uri}
            contentFit="contain"
            style={StyleSheet.absoluteFill}
            onLoadSize={(natural) => {
              const fitted = fitSize(natural, { width, height });
              fittedW.set(fitted.width);
              fittedH.set(fitted.height);
            }}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tint: { backgroundColor: '#000000' },
  chrome: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  counter: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
