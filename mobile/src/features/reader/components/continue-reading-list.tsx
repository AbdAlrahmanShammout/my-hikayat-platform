import { useQueries } from '@tanstack/react-query';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { useContinueReading } from '@/features/reader/hooks/use-continue-reading';
import { formatContinueReadingLabel } from '@/features/reader/lib/continue-reading';
import { theme } from '@/theme/theme';
import { ErrorState } from '@/ui/feedback/error-state';
import { BookCard } from '@/ui/primitives/book-card';
import { Skeleton } from '@/ui/primitives/skeleton';

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
        <Skeleton height={110} width="100%" radius={theme.radii.lg} />
      </View>
    );
  }

  if (continueQuery.isError) {
    return (
      <View style={styles.block} testID="continue-reading-error">
        <Text style={styles.heading}>Continue reading</Text>
        <ErrorState
          description="Could not load your reading list."
          onRetry={() => {
            void continueQuery.refetch();
          }}
          retryLabel="Try again"
          retryTestID="continue-reading-retry"
        />
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
        const book = titleQueries[index]?.data;
        const title: string = book?.title ?? `Book ${item.bookId}`;
        const cover = resolveCatalogCoverPresentation(book?.cover);
        return (
          <BookCard
            key={item.id}
            variant="continue"
            title={title}
            authorName={book?.authorName}
            coverUri={cover.kind === 'image' ? cover.url : null}
            progressLabel={formatContinueReadingLabel(item)}
            onPress={() => {
              onContinue(item.bookId);
            }}
            accessibilityLabel={`Continue reading ${title}`}
            testID={`continue-reading-item-${item.bookId}`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
});
