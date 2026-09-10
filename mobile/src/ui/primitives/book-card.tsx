import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';
import { BookCover, type BookCoverSize } from '@/ui/primitives/book-cover';

export type BookCardVariant = 'grid' | 'compact' | 'continue';

type BookCardProps = {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: BookCardVariant;
  readonly authorName?: string | null;
  readonly coverUri?: string | null;
  readonly progressLabel?: string;
  readonly showCoverProgress?: boolean;
  readonly progressFraction?: number;
  readonly isLocked?: boolean;
  readonly isDownloaded?: boolean;
  readonly isDownloading?: boolean;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
};

/**
 * Presentational book tile. Progress belongs on Continue Reading only;
 * parents must not pass catalog progress or invented metadata.
 */
export function BookCard({
  title,
  onPress,
  variant = 'grid',
  authorName,
  coverUri,
  progressLabel,
  showCoverProgress = false,
  progressFraction,
  isLocked = false,
  isDownloaded = false,
  isDownloading = false,
  testID,
  accessibilityLabel,
}: BookCardProps): JSX.Element {
  const isContinue = variant === 'continue';
  const coverSize = resolveCoverSize(variant);
  const allowProgress = isContinue && showCoverProgress;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        variant === 'compact' ? styles.compact : null,
        variant === 'grid' ? styles.grid : null,
        isContinue ? [styles.continue, toViewShadow(theme.shadows.sm)] : null,
      ]}
    >
      <BookCover
        title={title}
        coverUri={coverUri}
        size={coverSize}
        isLocked={isLocked}
        isDownloaded={isDownloaded}
        isDownloading={isDownloading}
        showProgress={allowProgress}
        progressFraction={progressFraction}
      />
      <View style={isContinue ? styles.continueText : styles.stackText}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {authorName !== null && authorName !== undefined && authorName !== '' ? (
          <Text style={styles.author} numberOfLines={1}>
            {authorName}
          </Text>
        ) : null}
        {isContinue && progressLabel !== undefined ? (
          <Text style={styles.progressLabel} numberOfLines={1}>
            {progressLabel}
          </Text>
        ) : null}
      </View>
      {isContinue ? (
        <View style={styles.play} accessibilityElementsHidden>
          <Text style={styles.playMark}>▶</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function resolveCoverSize(variant: BookCardVariant): BookCoverSize {
  if (variant === 'continue') {
    return 'sm';
  }
  if (variant === 'compact') {
    return 'compact';
  }
  return 'grid';
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  compact: {
    width: 100,
    gap: theme.spacing.xs,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignSelf: 'stretch',
  },
  stackText: {
    gap: theme.spacing.scale.xs,
  },
  continueText: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.scale.xs,
  },
  title: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  author: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  progressLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  play: {
    width: theme.spacing.xxl,
    height: theme.spacing.xxl,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMark: {
    color: theme.colors.textOnBrand,
    fontSize: theme.typography.label.fontSize,
  },
});
