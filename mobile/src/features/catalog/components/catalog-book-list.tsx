import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError } from '@/api/api-error';
import { CatalogBookRow } from '@/features/catalog/components/catalog-book-row';
import { CatalogBrowseFilters } from '@/features/catalog/components/catalog-browse-filters';
import type { CatalogSort } from '@/features/catalog/api/list-catalog-books';
import { useCatalogBooks } from '@/features/catalog/hooks/use-catalog-books';
import { useReaderCategories } from '@/features/catalog/hooks/use-reader-categories';
import {
  flattenCatalogBookPages,
  formatCatalogResultCountLabel,
} from '@/features/catalog/lib/catalog-pagination';
import { theme } from '@/theme/theme';

type CatalogBookListProps = {
  readonly onOpenBook: (bookId: number) => void;
};

/**
 * Home catalog browse: filters + virtualized book list with infinite paging.
 */
export function CatalogBookList({ onOpenBook }: CatalogBookListProps): JSX.Element {
  const [sort, setSort] = useState<CatalogSort>('newest');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const categoriesQuery = useReaderCategories();
  const booksQuery = useCatalogBooks({
    sort,
    categoryId,
  });

  if (booksQuery.isLoading) {
    return (
      <View style={styles.centered} accessibilityLabel="Loading books">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (booksQuery.isError && booksQuery.data === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{toUserFacingMessage(booksQuery.error)}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            void booksQuery.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
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
    <View style={styles.container}>
      <CatalogBrowseFilters
        sort={sort}
        categoryId={categoryId}
        categories={categoriesQuery.data?.categories ?? []}
        onChangeSort={setSort}
        onChangeCategoryId={setCategoryId}
      />
      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <CatalogBookRow book={item} onPress={onOpenBook} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
          <Text style={styles.empty}>No books here yet. Check back after more books are published.</Text>
        }
        ListHeaderComponent={
          countLabel !== '' ? (
            <Text style={styles.count} testID="catalog-result-count">
              {countLabel}
            </Text>
          ) : null
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
    </View>
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
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }
  if (input.isFetchNextPageError) {
    return (
      <View style={styles.footer}>
        <Text style={styles.error}>Could not load more books.</Text>
        <Pressable
          style={styles.retryButton}
          onPress={input.onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try loading more"
          testID="catalog-load-more-retry"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: theme.spacing.xxxl,
    gap: 0,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  separator: {
    height: theme.spacing.sm,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  endLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  retryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 160,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  retryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
