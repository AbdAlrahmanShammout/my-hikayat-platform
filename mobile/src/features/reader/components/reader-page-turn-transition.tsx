import { useEffect, useRef, type JSX, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type ReaderPageTurnDirection = 'next' | 'previous' | 'none';

type ReaderPageTurnTransitionProps = {
  readonly pageKey: string | number;
  readonly direction: ReaderPageTurnDirection;
  readonly style?: StyleProp<ViewStyle>;
  readonly children: ReactNode;
};

const PAGE_TURN_MS = 260;
const PAGE_TURN_TRANSLATE = 36;
const PAGE_TURN_DEGREES = 8;
const PERSPECTIVE = 900;

/**
 * Lightweight page-turn motion for reader page changes.
 */
export function ReaderPageTurnTransition({
  pageKey,
  direction,
  style,
  children,
}: ReaderPageTurnTransitionProps): JSX.Element {
  const reduceMotion: boolean = useReducedMotion();
  const progress = useSharedValue(1);
  const previousPageKeyRef = useRef<string | number>(pageKey);
  const directionSign: number = resolveDirectionSign(direction);
  useEffect(() => {
    if (previousPageKeyRef.current === pageKey) {
      return;
    }
    previousPageKeyRef.current = pageKey;
    if (reduceMotion || directionSign === 0) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: PAGE_TURN_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [directionSign, pageKey, progress, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => {
    const hiddenFraction: number = 1 - progress.value;
    return {
      opacity: 0.92 + progress.value * 0.08,
      transform: [
        { perspective: PERSPECTIVE },
        { translateX: hiddenFraction * PAGE_TURN_TRANSLATE * directionSign },
        { rotateY: `${hiddenFraction * PAGE_TURN_DEGREES * -directionSign}deg` },
      ],
    };
  });
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

function resolveDirectionSign(direction: ReaderPageTurnDirection): number {
  if (direction === 'next') {
    return 1;
  }
  if (direction === 'previous') {
    return -1;
  }
  return 0;
}
