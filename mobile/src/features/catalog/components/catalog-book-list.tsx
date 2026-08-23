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
import { theme } from '@/theme/theme';

const PAGE_SIZE = 20;

type CatalogBookListProps = {
  readonly onOpenBook: (bookId: number) => void;
};

/**
 * Home catalog browse: filters + virtualized book list.
 */
export function CatalogBookList({ onOpenBook }: CatalogBookListProps): JSX.Element {
  const [sort, setSort] = useState<CatalogSort>('newest');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const categoriesQuery = useReaderCategories();
  const booksQuery = useCatalogBooks({
    limit: PAGE_SIZE,
    offset: 0,
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

  if (booksQuery.isError) {
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

  const books = booksQuery.data?.books ?? [];
  const total = booksQuery.data?.total ?? 0;

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
            refreshing={booksQuery.isRefetching}
            onRefresh={() => {
              void booksQuery.refetch();
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No books here yet. Check back after more books are published.</Text>
        }
        ListHeaderComponent={
          total > 0 ? <Text style={styles.count}>{`${total} book${total === 1 ? '' : 's'}`}</Text> : null
        }
      />
    </View>
  );
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
