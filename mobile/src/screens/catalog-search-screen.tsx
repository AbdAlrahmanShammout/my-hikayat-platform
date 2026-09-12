import { router } from 'expo-router';
import { useEffect, useState, type JSX } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { useCatalogBooks } from '@/features/catalog/hooks/use-catalog-books';
import { useReaderCategories } from '@/features/catalog/hooks/use-reader-categories';
import {
  flattenCatalogBookPages,
  formatCatalogResultCountLabel,
} from '@/features/catalog/lib/catalog-pagination';
import { resolveCatalogBookAttribution } from '@/features/catalog/lib/resolve-catalog-book-attribution';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import type { SearchCatalogField } from '@/features/search/api/search-catalog-books';
import { useSearchCatalogBooks } from '@/features/search/hooks/use-search-catalog-books';
import { buildSearchCatalogQuery } from '@/features/search/lib/build-search-catalog-query';
import {
  readSearchRecents,
  rememberSearchRecent,
  type SearchRecent,
} from '@/features/search/lib/search-recents-storage';
import { theme } from '@/theme/theme';
import { EmptyState } from '@/ui/feedback/empty-state';
import { ErrorState } from '@/ui/feedback/error-state';
import { TextField } from '@/ui/forms/text-field';
import { BackHeader } from '@/ui/primitives/back-header';
import { BookCard } from '@/ui/primitives/book-card';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

const FIELD_OPTIONS: { readonly field: SearchCatalogField; readonly label: string }[] = [
  { field: 'title', label: 'Title' },
  { field: 'author', label: 'Author' },
  { field: 'publisher', label: 'Publisher' },
];

/**
 * Catalog metadata search. Opens the existing book detail route for a result.
 */
export function CatalogSearchScreen(): JSX.Element {
  const [draftQuery, setDraftQuery] = useState<string>('');
  const [draftField, setDraftField] = useState<SearchCatalogField>('title');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [submittedField, setSubmittedField] = useState<SearchCatalogField>('title');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [recents, setRecents] = useState<SearchRecent[]>([]);
  const hasSubmitted: boolean = submittedQuery.trim().length > 0;
  const categoriesQuery = useReaderCategories();
  const searchInput = buildSearchCatalogQuery({
    field: submittedField,
    query: submittedQuery,
  });
  const searchQuery = useSearchCatalogBooks({
    ...(searchInput ?? {}),
    enabled: searchInput !== null,
  });
  const categoryBrowseQuery = useCatalogBooks({
    categoryId: selectedCategoryId ?? undefined,
    enabled: selectedCategoryId !== null && !hasSubmitted,
  });

  useEffect(() => {
    void readSearchRecents().then(setRecents);
  }, []);

  function executeSearch(): void {
    const nextQuery: string = draftQuery.trim().replace(/\s+/g, ' ');
    setSubmittedQuery(nextQuery);
    setSubmittedField(draftField);
    setSelectedCategoryId(null);
    if (nextQuery.length > 0) {
      void rememberSearchRecent({ query: nextQuery, field: draftField }).then(setRecents);
    }
  }

  function clearSearch(): void {
    setDraftQuery('');
    setSubmittedQuery('');
    setDraftField('title');
    setSubmittedField('title');
    setSelectedCategoryId(null);
  }

  const books = flattenCatalogBookPages(searchQuery.data?.pages ?? []);
  const total: number = searchQuery.data?.pages[0]?.total ?? 0;
  const hasNextPage: boolean = searchQuery.hasNextPage === true;
  const countLabel: string = formatCatalogResultCountLabel({
    loadedCount: books.length,
    total,
    hasNextPage,
  });
  const categoryBooks = flattenCatalogBookPages(categoryBrowseQuery.data?.pages ?? []);
  const categoryTotal: number = categoryBrowseQuery.data?.pages[0]?.total ?? 0;
  const categoryHasNextPage: boolean = categoryBrowseQuery.hasNextPage === true;
  const isBrowsingCategory: boolean = !hasSubmitted && selectedCategoryId !== null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID="search-screen">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackHeader
          title="Search"
          titleTestID="search-title"
          backTestID="search-back-button"
          onPressBack={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/(app)/(tabs)/home');
          }}
        />
        <View style={styles.header}>
          <Text style={styles.body}>Find a book by title, author, or publisher.</Text>
          <Text style={styles.label}>Search by</Text>
          <View style={styles.row}>
            {FIELD_OPTIONS.map((option) => {
              const isSelected: boolean = draftField === option.field;
              return (
                <Pressable
                  key={option.field}
                  style={[styles.chip, isSelected ? styles.chipSelected : null]}
                  onPress={() => {
                    setDraftField(option.field);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Search by ${option.label}`}
                  testID={`search-field-${option.field}`}
                >
                  <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextField
            label="Search text"
            isLabelHidden
            value={draftQuery}
            onChangeText={setDraftQuery}
            placeholder="Type words to search"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={executeSearch}
            accessibilityLabel="Search text"
            testID="search-query-input"
          />
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button
                label="Search"
                onPress={executeSearch}
                accessibilityLabel="Search"
                testID="search-submit-button"
              />
            </View>
            <Button
              label="Clear"
              variant="secondary"
              isFullWidth={false}
              onPress={clearSearch}
              accessibilityLabel="Clear search"
              testID="search-clear-button"
            />
          </View>
        </View>
        <View style={styles.results} testID="search-results">
          {!hasSubmitted && selectedCategoryId === null ? (
            <SearchIdleCategories
              categories={categoriesQuery.data?.categories ?? []}
              recents={recents}
              isLoading={categoriesQuery.isLoading}
              isError={categoriesQuery.isError}
              onRetry={() => {
                void categoriesQuery.refetch();
              }}
              onSelect={(categoryId) => {
                setSubmittedQuery('');
                setSelectedCategoryId(categoryId);
              }}
              onSelectRecent={(recent) => {
                setDraftQuery(recent.query);
                setDraftField(recent.field);
                setSubmittedQuery(recent.query);
                setSubmittedField(recent.field);
                setSelectedCategoryId(null);
              }}
            />
          ) : null}
          {isBrowsingCategory && categoryBrowseQuery.isLoading ? (
            <View style={styles.loadingBlock} accessibilityLabel="Loading category books">
              <SearchResultSkeleton />
              <SearchResultSkeleton />
            </View>
          ) : null}
          {isBrowsingCategory && categoryBrowseQuery.isError && categoryBrowseQuery.data === undefined ? (
            <ErrorState
              description={toUserFacingMessage(categoryBrowseQuery.error)}
              onRetry={() => {
                void categoryBrowseQuery.refetch();
              }}
              retryLabel="Try again"
              retryTestID="search-category-retry-button"
              testID="search-category-error"
            />
          ) : null}
          {isBrowsingCategory && (categoryBrowseQuery.isSuccess || categoryBrowseQuery.data !== undefined) ? (
            <FlatList
              data={categoryBooks}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <SearchBookRow
                  book={item}
                  onPress={() => {
                    router.push(`/(app)/books/${item.id}`);
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={
                categoryBooks.length === 0 ? styles.emptyContent : styles.listContent
              }
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                if (
                  !categoryHasNextPage ||
                  categoryBrowseQuery.isFetchingNextPage ||
                  categoryBrowseQuery.isFetchNextPageError
                ) {
                  return;
                }
                void categoryBrowseQuery.fetchNextPage();
              }}
              ListHeaderComponent={
                <Text style={styles.count} testID="search-category-result-count">
                  {formatCatalogResultCountLabel({
                    loadedCount: categoryBooks.length,
                    total: categoryTotal,
                    hasNextPage: categoryHasNextPage,
                  })}
                </Text>
              }
              ListEmptyComponent={
                <EmptyState
                  title="No books in this category yet."
                  description="Try another category or search by title."
                  testID="search-category-empty"
                />
              }
              ListFooterComponent={
                <SearchListFooter
                  isFetchingNextPage={categoryBrowseQuery.isFetchingNextPage}
                  isFetchNextPageError={categoryBrowseQuery.isFetchNextPageError}
                  hasNextPage={categoryHasNextPage}
                  loadedCount={categoryBooks.length}
                  onRetry={() => {
                    void categoryBrowseQuery.fetchNextPage();
                  }}
                />
              }
            />
          ) : null}
          {hasSubmitted && searchQuery.isLoading ? (
            <View style={styles.loadingBlock} accessibilityLabel="Loading search results">
              <SearchResultSkeleton />
              <SearchResultSkeleton />
              <SearchResultSkeleton />
              <SearchResultSkeleton />
            </View>
          ) : null}
          {hasSubmitted && searchQuery.isError && searchQuery.data === undefined ? (
            <ErrorState
              description={toUserFacingMessage(searchQuery.error)}
              onRetry={() => {
                void searchQuery.refetch();
              }}
              retryLabel="Try again"
              retryTestID="search-retry-button"
              testID="search-error"
            />
          ) : null}
          {hasSubmitted && (searchQuery.isSuccess || searchQuery.data !== undefined) ? (
            <FlatList
              data={books}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <SearchBookRow
                  book={item}
                  onPress={() => {
                    router.push(`/(app)/books/${item.id}`);
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={
                books.length === 0 ? styles.emptyContent : styles.listContent
              }
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                if (
                  !hasNextPage ||
                  searchQuery.isFetchingNextPage ||
                  searchQuery.isFetchNextPageError
                ) {
                  return;
                }
                void searchQuery.fetchNextPage();
              }}
              ListHeaderComponent={
                countLabel !== '' ? (
                  <Text style={styles.count} testID="search-result-count">
                    {countLabel}
                  </Text>
                ) : null
              }
              ListEmptyComponent={
                <EmptyState
                  title="No books matched. Try different words."
                  description="Try a different title, author, or publisher."
                  testID="search-empty"
                />
              }
              ListFooterComponent={
                <SearchListFooter
                  isFetchingNextPage={searchQuery.isFetchingNextPage}
                  isFetchNextPageError={searchQuery.isFetchNextPageError}
                  hasNextPage={hasNextPage}
                  loadedCount={books.length}
                  onRetry={() => {
                    void searchQuery.fetchNextPage();
                  }}
                />
              }
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SearchIdleCategories(input: {
  readonly categories: ReadonlyArray<{ readonly id: number; readonly name: string }>;
  readonly recents: readonly SearchRecent[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry: () => void;
  readonly onSelect: (categoryId: number) => void;
  readonly onSelectRecent: (recent: SearchRecent) => void;
}): JSX.Element {
  return (
    <View testID="search-idle-hint">
      <Text style={styles.hint}>Type something, then tap Search. Or browse by category.</Text>
      {input.recents.length > 0 ? (
        <View testID="search-recents">
          <Text style={styles.label}>Recent searches</Text>
          <View style={styles.row}>
            {input.recents.map((recent) => (
              <Pressable
                key={`${recent.field}-${recent.query}`}
                style={styles.chip}
                onPress={() => {
                  input.onSelectRecent(recent);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Search ${recent.field} ${recent.query}`}
                testID={`search-recent-${recent.field}-${recent.query}`}
              >
                <Text style={styles.chipLabel}>{recent.query}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <Text style={styles.label}>Browse by category</Text>
      {input.isLoading ? (
        <View style={styles.row}>
          <Skeleton height={44} width={88} radius={theme.radii.full} />
          <Skeleton height={44} width={110} radius={theme.radii.full} />
        </View>
      ) : null}
      {input.isError ? (
        <ErrorState
          description="Could not load categories."
          onRetry={input.onRetry}
          retryLabel="Try again"
          retryTestID="search-categories-retry"
        />
      ) : null}
      {!input.isLoading && !input.isError ? (
        <View style={styles.row} testID="search-idle-categories">
          {input.categories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.chip}
              onPress={() => {
                input.onSelect(category.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${category.name}`}
              testID={`search-category-${category.id}`}
            >
              <Text style={styles.chipLabel}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SearchBookRow(input: {
  readonly book: CatalogBook;
  readonly onPress: () => void;
}): JSX.Element {
  const attribution = resolveCatalogBookAttribution(input.book);
  const cover = resolveCatalogCoverPresentation(input.book.cover);
  return (
    <BookCard
      title={input.book.title}
      authorName={attribution.authorLine}
      publisherName={attribution.publisherLine}
      showChevron
      coverUri={cover.kind === 'image' ? cover.url : null}
      variant="row"
      onPress={input.onPress}
      accessibilityLabel={`Open ${input.book.title}`}
    />
  );
}

function SearchResultSkeleton(): JSX.Element {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={52} height={78} radius={theme.radii.sm} />
      <View style={styles.skeletonText}>
        <Skeleton height={16} width="70%" />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}

function SearchListFooter(input: {
  readonly isFetchingNextPage: boolean;
  readonly isFetchNextPageError: boolean;
  readonly hasNextPage: boolean;
  readonly loadedCount: number;
  readonly onRetry: () => void;
}): JSX.Element | null {
  if (input.isFetchingNextPage) {
    return (
      <View style={styles.footer} testID="search-loading-more">
        <Skeleton height={16} width="40%" />
      </View>
    );
  }
  if (input.isFetchNextPageError) {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerError}>Could not load more results.</Text>
        <Button
          label="Try again"
          onPress={input.onRetry}
          accessibilityLabel="Try loading more"
          testID="search-load-more-retry"
        />
      </View>
    );
  }
  if (!input.hasNextPage && input.loadedCount > 0) {
    return (
      <Text style={styles.endLabel} testID="search-end-of-results">
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
  return 'Could not search books.';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  label: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.full,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  chipLabelSelected: {
    color: theme.colors.textOnBrand,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  results: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  hint: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  loadingBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  skeletonText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    paddingVertical: theme.spacing.md,
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
