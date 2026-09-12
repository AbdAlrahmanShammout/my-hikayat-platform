import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { OfflineDownloadProgress } from '@/features/offline/lib/offline-download-progress-store';
import { theme } from '@/theme/theme';
import { BookCover } from '@/ui/primitives/book-cover';

type OfflineDownloadingBookRowProps = {
  readonly progress: OfflineDownloadProgress;
};

/**
 * In-list download progress for a book that is not yet in the leased package list.
 */
export function OfflineDownloadingBookRow({
  progress,
}: OfflineDownloadingBookRowProps): JSX.Element {
  return (
    <View style={styles.row} testID={`library-offline-downloading-${progress.bookId}`}>
      <BookCover title={progress.title} coverUri={null} size="sm" isDownloading />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {progress.title}
        </Text>
        <Text style={styles.label} testID="library-offline-download-progress">
          {progress.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.scale.xs,
  },
  title: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});
