import { useState, type JSX, type ReactNode } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/api-error';
import { CatalogBrowseFilters } from '@/features/catalog/components/catalog-browse-filters';
import { CatalogGridCard } from '@/features/catalog/components/catalog-grid-card';
import type { CatalogSort } from '@/features/catalog/api/list-catalog-books';
import { useCatalogBooks } from '@/features/catalog/hooks/use-catalog-books';
import { useReaderCategories } from '@/features/catalog/hooks/use-reader-categories';
import {
  flattenCatalogBookPages,
  formatCatalogResultCountLabel,
} from '@/features/catalog/lib/catalog-pagination';
import { theme } from '@/theme/theme';
import { EmptyState } from '@/ui/feedback/empty-state';
import { ErrorState } from '@/ui/feedback/error-state';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

type CatalogBookListProps = {
  readonly onOpenBook: (bookId: number) => void;
  readonly header?: ReactNode;
  readonly variant?: 'browse' | 'newest';
};

/**
 * Catalog browse or newest list with virtualized paging.
 */
export function CatalogBookList({
  onOpenBook,
  header,
  variant = 'browse',
}: CatalogBookListProps): JSX.Element {
  const [sort, setSort] = useState<CatalogSort>('newest');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const categoriesQuery = useReaderCategories();
  const booksQuery = useCatalogBooks({
    sort: variant === 'newest' ? 'newest' : sort,
    categoryId: variant === 'newest' ? undefined : categoryId,
  });
  const catalogHeading: string = variant === 'newest' ? 'Newest stories' : 'Browse Stories';

  if (booksQuery.isLoading) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.catalogPad} accessibilityLabel="Loading books">
          <Text style={styles.sectionLabel}>{catalogHeading}</Text>
          <View style={styles.gridSkeleton}>
            <Skeleton height={210} width="48%" radius={theme.radii.sm} />
            <Skeleton height={210} width="48%" radius={theme.radii.sm} />
            <Skeleton height={210} width="48%" radius={theme.radii.sm} />
            <Skeleton height={210} width="48%" radius={theme.radii.sm} />
          </View>
        </View>
      </View>
    );
  }

  if (booksQuery.isError && booksQuery.data === undefined) {
    return (
      <View style={styles.container}>
        {header}
        <ErrorState
          description={toUserFacingMessage(booksQuery.error)}
          onRetry={() => {
            void booksQuery.refetch();
          }}
          retryLabel="Try again"
        />
      </View>
    );
  }

  const books = flattenCatalogBookPages(booksQuery.data?.pages ?? []);
  const total: number = booksQuery.data?.pages[0]?.total ?? 0;
  const hasNextPage: boolean = booksQuery.hasNextPage === true;
  const countLabel: string = formatCatalogResultCountLabel({
    loadedCount: books.length,
    total,
    hasNextPage,
  });

  return (
    <FlatList
      style={styles.container}
      data={books}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.column}
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
      <CatalogGridCard book={item} onPress={onOpenBook} />
        </View>
      )}
      contentContainerStyle={books.length === 0 ? styles.emptyContent : styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={booksQuery.isRefetching && !booksQuery.isFetchingNextPage}
          onRefresh={() => {
            void booksQuery.refetch();
          }}
          tintColor={theme.colors.primary}
        />
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!hasNextPage || booksQuery.isFetchingNextPage || booksQuery.isFetchNextPageError) {
          return;
        }
        void booksQuery.fetchNextPage();
      }}
      ListEmptyComponent={
        <EmptyState
          title="No books here yet. Check back after more books are published."
          description="New stories will appear here when they are ready to read."
        />
      }
      ListHeaderComponent={
        <View>
          {header}
          <View style={styles.catalogPad}>
            {variant === 'browse' ? (
              <>
                <Text style={styles.sectionLabel}>{catalogHeading}</Text>
                <CatalogBrowseFilters
                  sort={sort}
                  categoryId={categoryId}
                  categories={categoriesQuery.data?.categories ?? []}
                  onChangeSort={setSort}
                  onChangeCategoryId={setCategoryId}
                />
              </>
            ) : null}
            {countLabel !== '' ? (
              <Text style={styles.count} testID="catalog-result-count">
                {countLabel}
              </Text>
            ) : null}
          </View>
        </View>
      }
      ListFooterComponent={
        <CatalogListFooter
          isFetchingNextPage={booksQuery.isFetchingNextPage}
          isFetchNextPageError={booksQuery.isFetchNextPageError}
          hasNextPage={hasNextPage}
          loadedCount={books.length}
          onRetry={() => {
            void booksQuery.fetchNextPage();
          }}
        />
      }
    />
  );
}

function CatalogListFooter(input: {
  readonly isFetchingNextPage: boolean;
  readonly isFetchNextPageError: boolean;
  readonly hasNextPage: boolean;
  readonly loadedCount: number;
  readonly onRetry: () => void;
}): JSX.Element | null {
  if (input.isFetchingNextPage) {
    return (
      <View style={styles.footer} testID="catalog-loading-more">
        <Skeleton height={16} width="40%" />
      </View>
    );
  }
  if (input.isFetchNextPageError) {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerError}>Could not load more books.</Text>
        <Button
          label="Try again"
          onPress={input.onRetry}
          accessibilityLabel="Try loading more"
          testID="catalog-load-more-retry"
        />
      </View>
    );
  }
  if (!input.hasNextPage && input.loadedCount > 0) {
    return (
      <Text style={styles.endLabel} testID="catalog-end-of-results">
        End of results
      </Text>
    );
  }
  return null;
}

function toUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return 'Could not load books.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  catalogPad: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  column: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  footer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerError: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
  endLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});
