import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { CatalogGridCard } from '@/features/catalog/components/catalog-grid-card';
import { HOME_NEW_BOOK_LIMIT } from '@/features/catalog/consts/home-catalog.constant';
import { useCatalogBooks } from '@/features/catalog/hooks/use-catalog-books';
import { flattenCatalogBookPages } from '@/features/catalog/lib/catalog-pagination';
import { theme } from '@/theme/theme';
import { Skeleton } from '@/ui/primitives/skeleton';

type HomeNewBooksSectionProps = {
  readonly onOpenBook: (bookId: number) => void;
};

/**
 * Finite newest-books grid. See all opens the dedicated newest list, not Collections.
 */
export function HomeNewBooksSection({ onOpenBook }: HomeNewBooksSectionProps): JSX.Element | null {
  const booksQuery = useCatalogBooks({
    sort: 'newest',
    pageSize: HOME_NEW_BOOK_LIMIT,
  });
  const books: CatalogBook[] = flattenCatalogBookPages(booksQuery.data?.pages ?? []).slice(
    0,
    HOME_NEW_BOOK_LIMIT,
  );
  const total: number = booksQuery.data?.pages[0]?.total ?? 0;
  if (booksQuery.isLoading) {
    return (
      <View style={styles.section} accessibilityLabel="Loading new books">
        <HomeNewHeader showSeeAll={false} />
        <View style={styles.grid}>
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
        </View>
      </View>
    );
  }
  if (booksQuery.isError || books.length === 0) {
    return null;
  }
  return (
    <View style={styles.section} testID="home-new-section">
      <HomeNewHeader showSeeAll={total > books.length} />
      <View style={styles.grid}>
        {books.map((book) => (
          <View key={book.id} style={styles.gridItem}>
            <CatalogGridCard book={book} onPress={onOpenBook} />
          </View>
        ))}
      </View>
    </View>
  );
}

function HomeNewHeader(input: { readonly showSeeAll: boolean }): JSX.Element {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.sectionLabel}>New in My Hikayat</Text>
      {input.showSeeAll ? (
        <Pressable
          onPress={() => {
            router.push('/(app)/books/newest' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel="See all new books"
          testID="home-new-see-all"
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  seeAll: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  gridItem: {
    width: '48%',
  },
});
