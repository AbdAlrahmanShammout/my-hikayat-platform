import { useRef, type JSX, type RefObject } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type ScrollView } from 'react-native';

import { resolveReaderPageSwipe } from '@/features/reader/lib/resolve-reader-page-swipe';

const TAP_SLOP_PX = 24;

type ScrollOffset = {
  x: number;
  y: number;
};

type TouchTrack = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
};

type ReaderPageTapLayerProps = {
  readonly accessibilityLabel: string;
  readonly isPanEnabled: boolean;
  readonly onToggle: () => void;
  readonly onSwipeNext: () => void;
  readonly onSwipePrevious: () => void;
  readonly scrollRef: RefObject<ScrollView | null>;
  readonly scrollOffsetRef: RefObject<ScrollOffset>;
};

/**
 * Tap toggles chrome. A horizontal swipe turns the page. A drag pans only while zoomed in.
 */
export function ReaderPageTapLayer({
  accessibilityLabel,
  isPanEnabled,
  onToggle,
  onSwipeNext,
  onSwipePrevious,
  scrollRef,
  scrollOffsetRef,
}: ReaderPageTapLayerProps): JSX.Element {
  const trackRef = useRef<TouchTrack | null>(null);
  const didMoveRef = useRef<boolean>(false);
  const handleTouchStart = (event: GestureResponderEvent): void => {
    trackRef.current = {
      startX: event.nativeEvent.pageX,
      startY: event.nativeEvent.pageY,
      lastX: event.nativeEvent.pageX,
      lastY: event.nativeEvent.pageY,
    };
    didMoveRef.current = false;
  };
  const handleTouchMove = (event: GestureResponderEvent): void => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }
    const deltaX: number = event.nativeEvent.pageX - track.lastX;
    const deltaY: number = event.nativeEvent.pageY - track.lastY;
    const travelX: number = event.nativeEvent.pageX - track.startX;
    const travelY: number = event.nativeEvent.pageY - track.startY;
    if (travelX * travelX + travelY * travelY <= TAP_SLOP_PX * TAP_SLOP_PX) {
      return;
    }
    didMoveRef.current = true;
    track.lastX = event.nativeEvent.pageX;
    track.lastY = event.nativeEvent.pageY;
    if (!isPanEnabled) {
      return;
    }
    const nextX: number = Math.max(0, scrollOffsetRef.current.x - deltaX);
    const nextY: number = Math.max(0, scrollOffsetRef.current.y - deltaY);
    scrollOffsetRef.current.x = nextX;
    scrollOffsetRef.current.y = nextY;
    scrollRef.current?.scrollTo({ x: nextX, y: nextY, animated: false });
  };
  const handleTouchEnd = (event: GestureResponderEvent): void => {
    const track = trackRef.current;
    const didMove: boolean = didMoveRef.current;
    trackRef.current = null;
    didMoveRef.current = false;
    if (track === null) {
      return;
    }
    if (!didMove) {
      onToggle();
      return;
    }
    if (isPanEnabled) {
      return;
    }
    const swipe = resolveReaderPageSwipe({
      deltaX: event.nativeEvent.pageX - track.startX,
      deltaY: event.nativeEvent.pageY - track.startY,
    });
    if (swipe === 'next') {
      onSwipeNext();
      return;
    }
    if (swipe === 'previous') {
      onSwipePrevious();
    }
  };
  const handleTouchCancel = (): void => {
    trackRef.current = null;
    didMoveRef.current = false;
  };
  return (
    <View
      style={styles.layer}
      testID="reader-page-tap"
      accessibilityLabel={accessibilityLabel}
      accessible={false}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});
