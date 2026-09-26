import { type JSX } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { BookOpenProgress } from '@/features/reader/lib/download-and-decrypt-book-source';
import { formatBookOpenProgress } from '@/features/reader/lib/format-book-open-progress';
import { theme } from '@/theme/theme';

type BookOpenProgressViewProps = {
  readonly progress: BookOpenProgress | null;
  readonly pendingLabel?: string;
};

const PROGRESS_TRACK_WIDTH = 240;

/**
 * Real open progress: downloaded bytes versus the encrypted file size, then prepare.
 */
export function BookOpenProgressView({
  progress,
  pendingLabel = 'Preparing book…',
}: BookOpenProgressViewProps): JSX.Element {
  if (progress === null) {
    return (
      <>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.label}>{pendingLabel}</Text>
      </>
    );
  }
  const formatted = formatBookOpenProgress(progress);
  const percentNow: number | undefined =
    formatted.fraction === null ? undefined : Math.round(formatted.fraction * 100);
  return (
    <View
      style={styles.block}
      accessibilityRole="progressbar"
      accessibilityLabel={formatted.label}
      accessibilityValue={
        percentNow === undefined ? undefined : { min: 0, max: 100, now: percentNow }
      }
      testID="book-open-progress"
    >
      {formatted.fraction === null ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <View style={styles.track} testID="book-open-progress-track">
          <View
            style={[styles.fill, { width: `${formatted.fraction * 100}%` }]}
            testID="book-open-progress-fill"
          />
        </View>
      )}
      <Text style={styles.label} testID="book-open-progress-label">
        {formatted.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: '100%',
  },
  track: {
    width: PROGRESS_TRACK_WIDTH,
    height: 8,
    borderRadius: 2,
    backgroundColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
