import type { JSX } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/theme/theme';

export type SkeletonShape = 'rect' | 'rounded' | 'circle';

type SkeletonProps = {
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly shape?: SkeletonShape;
  readonly radius?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
};

/**
 * Static placeholder block for covers, rows, and cards. No extra animation library.
 */
export function Skeleton({
  width = '100%',
  height = theme.spacing.md,
  shape = 'rounded',
  radius,
  style,
  testID,
}: SkeletonProps): JSX.Element {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      style={[
        styles.base,
        { width, height, borderRadius: resolveRadius(shape, radius) },
        style,
      ]}
    />
  );
}

function resolveRadius(shape: SkeletonShape, radius: number | undefined): number {
  if (radius !== undefined) {
    return radius;
  }
  if (shape === 'circle') {
    return theme.radii.full;
  }
  if (shape === 'rect') {
    return theme.radii.xs;
  }
  return theme.radii.sm;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.canvasWarm,
    overflow: 'hidden',
  },
});
