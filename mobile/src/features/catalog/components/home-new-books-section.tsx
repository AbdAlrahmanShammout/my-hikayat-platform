import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { CatalogGridCard } from '@/features/catalog/components/catalog-grid-card';
import { HOME_NEW_BOOK_LIMIT } from '@/features/catalog/consts/home-catalog.constant';
import { useCatalogBooks } from '@/features/catalog/hooks/use-catalog-books';
import { flattenCatalogBookPages } from '@/features/catalog/lib/catalog-pagination';
import { resolveHomeNewGridLayout } from '@/features/catalog/lib/resolve-home-new-grid-layout';
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
  const [contentWidth, setContentWidth] = useState<number>(0);
  const grid = resolveHomeNewGridLayout({
    contentWidth,
    gap: theme.spacing.sm,
  });
  function handleGridLayout(event: LayoutChangeEvent): void {
    const nextWidth: number = event.nativeEvent.layout.width;
    if (nextWidth !== contentWidth) {
      setContentWidth(nextWidth);
    }
  }
  const books: CatalogBook[] = flattenCatalogBookPages(booksQuery.data?.pages ?? []).slice(
    0,
    HOME_NEW_BOOK_LIMIT,
  );
  const total: number = booksQuery.data?.pages[0]?.total ?? 0;
  if (booksQuery.isLoading) {
    return (
      <View style={styles.section} accessibilityLabel="Loading new books">
        <HomeNewHeader showSeeAll={false} />
        <View style={styles.grid} onLayout={handleGridLayout}>
          {Array.from({ length: grid.columnCount }, (_, index) => (
            <Skeleton
              key={index}
              height={210}
              width={grid.itemWidth}
              radius={theme.radii.sm}
            />
          ))}
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
      <View style={styles.grid} onLayout={handleGridLayout}>
        {books.map((book) => (
          <View key={book.id} style={[styles.gridItem, { width: grid.itemWidth }]}>
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
    gap: theme.spacing.sm,
  },
  gridItem: {
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: '100%',
  },
});
