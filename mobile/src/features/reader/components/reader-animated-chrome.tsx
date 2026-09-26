import { useEffect, type JSX, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CHROME_MOTION_MS = 240;
const CHROME_SLIDE_DISTANCE = 64;

type ReaderChromeEdge = 'top' | 'bottom' | 'fade';

type ReaderAnimatedChromeProps = {
  readonly isVisible: boolean;
  readonly edge: ReaderChromeEdge;
  readonly style?: StyleProp<ViewStyle>;
  readonly children: ReactNode;
};

/**
 * Slides the reader top or bottom bar in and out. Reduced motion skips the slide.
 */
export function ReaderAnimatedChrome({
  isVisible,
  edge,
  style,
  children,
}: ReaderAnimatedChromeProps): JSX.Element {
  const reduceMotion: boolean = useReducedMotion();
  const progress = useSharedValue(isVisible ? 1 : 0);
  useEffect(() => {
    const duration: number = reduceMotion ? 0 : CHROME_MOTION_MS;
    progress.value = withTiming(isVisible ? 1 : 0, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [isVisible, progress, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => {
    const hiddenOffset: number = resolveHiddenOffset(edge);
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * hiddenOffset }],
    };
  });
  return (
    <Animated.View
      style={[style, animatedStyle]}
      pointerEvents={isVisible ? 'auto' : 'none'}
      accessibilityElementsHidden={!isVisible}
      importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </Animated.View>
  );
}

function resolveHiddenOffset(edge: ReaderChromeEdge): number {
  'worklet';
  if (edge === 'top') {
    return -CHROME_SLIDE_DISTANCE;
  }
  if (edge === 'bottom') {
    return CHROME_SLIDE_DISTANCE;
  }
  return 0;
}
