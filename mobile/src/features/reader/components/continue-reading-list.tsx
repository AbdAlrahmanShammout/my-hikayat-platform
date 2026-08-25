import { useQueries } from '@tanstack/react-query';
import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { useContinueReading } from '@/features/reader/hooks/use-continue-reading';
import { formatContinueReadingLabel } from '@/features/reader/lib/continue-reading';
import { theme } from '@/theme/theme';

type ContinueReadingListProps = {
  readonly onContinue: (bookId: number) => void;
};

/**
 * Home Continue Reading shelf backed by GET /reader/sync progress rows.
 */
export function ContinueReadingList({ onContinue }: ContinueReadingListProps): JSX.Element {
  const continueQuery = useContinueReading();
  const titleQueries = useQueries({
    queries: continueQuery.items.map((item) => ({
      queryKey: ['catalog', 'book', item.bookId],
      queryFn: () => getCatalogBook(item.bookId),
      enabled: continueQuery.items.length > 0,
    })),
  });

  if (continueQuery.isLoading) {
    return (
      <View style={styles.block} testID="continue-reading-loading">
        <Text style={styles.heading}>Continue reading</Text>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (continueQuery.isError) {
    return (
      <View style={styles.block} testID="continue-reading-error">
        <Text style={styles.heading}>Continue reading</Text>
        <Text style={styles.error}>Could not load your reading list.</Text>
        <Pressable
          style={styles.retryButton}
          onPress={continueQuery.refetch}
          accessibilityRole="button"
          accessibilityLabel="Retry continue reading"
          testID="continue-reading-retry"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (continueQuery.items.length === 0) {
    return (
      <View style={styles.block} testID="continue-reading-empty">
        <Text style={styles.heading}>Continue reading</Text>
        <Text style={styles.empty}>Open a book to start a reading trail here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.block} testID="continue-reading-list">
      <Text style={styles.heading}>Continue reading</Text>
      {continueQuery.items.map((item: ReadingProgress, index: number) => {
        const title: string = titleQueries[index]?.data?.title ?? `Book ${item.bookId}`;
        return (
          <Pressable
            key={item.id}
            style={styles.row}
            onPress={() => {
              onContinue(item.bookId);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Continue reading ${title}`}
            testID={`continue-reading-item-${item.bookId}`}
          >
            <Text style={styles.bookTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.meta}>{formatContinueReadingLabel(item)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.label,
    color: theme.colors.primaryMuted,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  retryButton: {
    minHeight: 48,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  row: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 2,
  },
  bookTitle: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
