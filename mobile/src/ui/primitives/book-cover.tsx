import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';

export type BookCoverSize = 'sm' | 'row' | 'md' | 'compact' | 'lg' | 'detail' | 'grid';

type BookCoverProps = {
  readonly title: string;
  readonly coverUri?: string | null;
  readonly size?: BookCoverSize;
  readonly isLocked?: boolean;
  readonly isDownloaded?: boolean;
  readonly isDownloading?: boolean;
  readonly showProgress?: boolean;
  readonly progressFraction?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
};

const COVER_SIZE = {
  sm: { width: 52, height: 78 },
  row: { width: 44, height: 66 },
  md: { width: 80, height: 120 },
  compact: { width: 100, height: 150 },
  lg: { width: 120, height: 180 },
  detail: { width: 160, height: 240 },
} as const;

/**
 * Presentational book artwork. Coarse continue-reading progress is optional;
 * catalog surfaces should omit `showProgress`.
 */
export function BookCover({
  title,
  coverUri,
  size = 'sm',
  isLocked = false,
  isDownloaded = false,
  isDownloading = false,
  showProgress = false,
  progressFraction,
  style,
  testID,
}: BookCoverProps): JSX.Element {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(coverUri !== null && coverUri !== undefined);
  const hasImage = coverUri !== null && coverUri !== undefined && coverUri !== '' && !hasError;
  const frameStyle = size === 'grid' ? styles.gridFrame : COVER_SIZE[size];
  const clampedProgress = clampProgress(progressFraction);
  return (
    <View style={[styles.shadowWrap, toViewShadow(theme.shadows.book), style]}>
      <View
        style={[styles.frame, frameStyle]}
        testID={testID}
        accessibilityRole="image"
        accessibilityLabel={buildCoverLabel(title, hasImage, isLocked, isDownloaded)}
      >
        {hasImage ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderLabel}>No cover</Text>
          </View>
        )}
        {hasImage && isLoading ? (
          <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} accessibilityElementsHidden>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}
        {isDownloading ? (
          <View style={StyleSheet.absoluteFillObject} accessibilityElementsHidden>
            <View style={[StyleSheet.absoluteFillObject, styles.dimFill]} />
            <View style={styles.centerOverlay}>
              <ActivityIndicator color={theme.colors.textOnBrand} />
            </View>
          </View>
        ) : null}
        {isLocked ? <View style={[StyleSheet.absoluteFillObject, styles.locked]} /> : null}
        {isDownloaded && !isLocked ? <View style={styles.downloadedDot} /> : null}
        {showProgress && clampedProgress !== null ? (
          <View
            style={styles.progressTrack}
            testID={`${testID ?? 'book-cover'}-progress`}
            accessibilityElementsHidden
          >
            <View style={[styles.progressFill, { width: `${clampedProgress * 100}%` }]} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function clampProgress(value: number | undefined): number | null {
  if (value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Math.min(1, Math.max(0, value));
}

function buildCoverLabel(
  title: string,
  hasImage: boolean,
  isLocked: boolean,
  isDownloaded: boolean,
): string {
  if (!hasImage) {
    return `No cover for ${title}`;
  }
  if (isLocked) {
    return `Locked cover for ${title}`;
  }
  if (isDownloaded) {
    return `Downloaded cover for ${title}`;
  }
  return `Cover for ${title}`;
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: theme.radii.sm,
  },
  frame: {
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderSubtle,
  },
  gridFrame: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.borderSubtle,
  },
  placeholderLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  dimFill: {
    backgroundColor: theme.colors.navBg,
    opacity: 0.45,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: {
    backgroundColor: theme.colors.navBg,
    opacity: 0.55,
  },
  downloadedDot: {
    position: 'absolute',
    right: theme.spacing.scale.xs,
    bottom: theme.spacing.scale.xs,
    width: theme.spacing.md,
    height: theme.spacing.md,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.success,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: theme.colors.surface,
    opacity: 0.9,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});
