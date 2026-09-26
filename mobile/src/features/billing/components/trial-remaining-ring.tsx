import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

const RING_SIZE = 56;
const RING_STROKE = 5;
const RING_HALF = RING_SIZE / 2;

type TrialRemainingRingProps = {
  readonly dayCount: number;
  readonly progress: number;
  readonly accessibilityLabel: string;
};

/**
 * Days-left count in the center of a circular remaining-time ring.
 */
export function TrialRemainingRing({
  dayCount,
  progress,
  accessibilityLabel,
}: TrialRemainingRingProps): JSX.Element {
  const clampedProgress: number = Math.min(1, Math.max(0, progress));
  const rightDegrees: number = -180 + Math.min(clampedProgress, 0.5) * 360;
  const leftDegrees: number = clampedProgress <= 0.5 ? 180 : 180 - (clampedProgress - 0.5) * 360;
  return (
    <View
      style={styles.ring}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID="home-trial-discovery-ring"
    >
      <View style={styles.track} />
      <View style={[styles.clip, styles.clipRight]} pointerEvents="none">
        <View style={[styles.sweep, styles.sweepRight, { transform: [{ rotate: `${rightDegrees}deg` }] }]} />
      </View>
      <View style={[styles.clip, styles.clipLeft]} pointerEvents="none">
        <View style={[styles.sweep, styles.sweepLeft, { transform: [{ rotate: `${leftDegrees}deg` }] }]} />
      </View>
      <View style={styles.hole}>
        <Text style={styles.count}>{dayCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_HALF,
    borderWidth: RING_STROKE,
    borderColor: theme.colors.success,
    opacity: 0.25,
  },
  clip: {
    position: 'absolute',
    top: 0,
    width: RING_HALF,
    height: RING_SIZE,
    overflow: 'hidden',
  },
  clipRight: {
    right: 0,
  },
  clipLeft: {
    left: 0,
  },
  sweep: {
    position: 'absolute',
    top: 0,
    width: RING_HALF,
    height: RING_SIZE,
    backgroundColor: theme.colors.success,
  },
  sweepRight: {
    right: 0,
    borderTopRightRadius: RING_HALF,
    borderBottomRightRadius: RING_HALF,
    transformOrigin: 'left center',
  },
  sweepLeft: {
    left: 0,
    borderTopLeftRadius: RING_HALF,
    borderBottomLeftRadius: RING_HALF,
    transformOrigin: 'right center',
  },
  hole: {
    position: 'absolute',
    top: RING_STROKE,
    left: RING_STROKE,
    width: RING_SIZE - RING_STROKE * 2,
    height: RING_SIZE - RING_STROKE * 2,
    borderRadius: RING_HALF,
    backgroundColor: theme.colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
    fontSize: theme.typography.scale.lg,
  },
});
