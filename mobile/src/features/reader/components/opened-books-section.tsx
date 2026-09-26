import { useQueries } from '@tanstack/react-query';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { queryKeys } from '@/api/query-keys';
import { getCatalogBook } from '@/features/catalog/api/get-catalog-book';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { useReadingProgressList } from '@/features/reader/hooks/use-reading-progress-list';
import { excludeDownloadedProgress } from '@/features/reader/lib/exclude-downloaded-progress';
import { resolveOpenedBookStatus } from '@/features/reader/lib/resolve-opened-book-status';
import { theme } from '@/theme/theme';
import { ErrorState } from '@/ui/feedback/error-state';
import { BookCover } from '@/ui/primitives/book-cover';
import { Skeleton } from '@/ui/primitives/skeleton';

type OpenedBooksSectionProps = {
  readonly downloadedBookIds: ReadonlySet<number>;
  readonly showHeading: boolean;
  readonly onOpen: (bookId: number) => void;
};

/**
 * Books this reader has opened, excluding ones already listed as downloads.
 */
export function OpenedBooksSection({
  downloadedBookIds,
  showHeading,
  onOpen,
}: OpenedBooksSectionProps): JSX.Element | null {
  const progress = useReadingProgressList();
  const items: readonly ReadingProgress[] = excludeDownloadedProgress(
    progress.items,
    downloadedBookIds,
  );
  const titleQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: queryKeys.catalog.book(item.bookId),
      queryFn: () => getCatalogBook(item.bookId),
      enabled: items.length > 0,
    })),
  });
  if (progress.isLoading) {
    return (
      <View style={styles.block} testID="library-opened-loading">
        <Skeleton height={88} width="100%" radius={theme.radii.md} />
      </View>
    );
  }
  if (progress.isError) {
    return (
      <ErrorState
        description="Could not load books you opened."
        onRetry={progress.refetch}
        retryLabel="Try again"
        retryTestID="library-opened-retry"
      />
    );
  }
  if (items.length === 0) {
    return null;
  }
  return (
    <View style={styles.block} testID="library-opened-list">
      {showHeading ? <Text style={styles.heading}>Opened</Text> : <Text style={styles.lead}>Books you opened</Text>}
      {items.map((item, index) => {
        const book = titleQueries[index]?.data;
        const title: string = book?.title ?? `Book ${item.bookId}`;
        const cover = resolveCatalogCoverPresentation(book?.cover);
        const authorName: string | null = coerceAuthorName(book?.authorName);
        return (
          <View key={item.id} style={styles.row} testID={`library-opened-book-${item.bookId}`}>
            <BookCover
              title={title}
              coverUri={cover.kind === 'image' ? cover.url : null}
              size="sm"
            />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {authorName !== null ? (
                <Text style={styles.author} numberOfLines={1}>
                  {authorName}
                </Text>
              ) : null}
              <Text style={styles.status} numberOfLines={1}>
                {resolveOpenedBookStatus(item)}
              </Text>
            </View>
            <Pressable
              style={styles.readButton}
              onPress={() => {
                onOpen(item.bookId);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Read ${title}`}
              testID={`library-opened-read-${item.bookId}`}
            >
              <Text style={styles.readLabel}>Read</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function coerceAuthorName(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const styles = StyleSheet.create({
  block: {
    gap: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
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
  author: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  status: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  readButton: {
    minHeight: 36,
    minWidth: 72,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  readLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnBrand,
  },
});
