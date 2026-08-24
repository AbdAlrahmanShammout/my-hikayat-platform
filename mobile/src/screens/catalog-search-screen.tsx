import { router } from 'expo-router';
import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import { CatalogBookRow } from '@/features/catalog/components/catalog-book-row';
import type { SearchCatalogField } from '@/features/search/api/search-catalog-books';
import { useSearchCatalogBooks } from '@/features/search/hooks/use-search-catalog-books';
import { buildSearchCatalogQuery } from '@/features/search/lib/build-search-catalog-query';
import { theme } from '@/theme/theme';

const PAGE_SIZE = 20;

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
  const searchInput = buildSearchCatalogQuery({
    field: submittedField,
    query: submittedQuery,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const searchQuery = useSearchCatalogBooks({
    ...(searchInput ?? {}),
    enabled: searchInput !== null,
  });

  function executeSearch(): void {
    const nextQuery: string = draftQuery.trim().replace(/\s+/g, ' ');
    setSubmittedQuery(nextQuery);
    setSubmittedField(draftField);
  }

  function clearSearch(): void {
    setDraftQuery('');
    setSubmittedQuery('');
    setDraftField('title');
    setSubmittedField('title');
  }

  const hasSubmitted: boolean = submittedQuery.trim().length > 0;
  const books = searchQuery.data?.books ?? [];
  const total = searchQuery.data?.total ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID="search-screen">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/(app)/(tabs)/home');
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="search-back-button"
          >
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header" testID="search-title">
            Search books
          </Text>
          <Text style={styles.body}>Find a book by title, author, or publisher.</Text>
          <Text style={styles.label}>Search by</Text>
          <View style={styles.row}>
            {FIELD_OPTIONS.map((option) => (
              <Pressable
                key={option.field}
                style={[styles.chip, draftField === option.field ? styles.chipSelected : null]}
                onPress={() => {
                  setDraftField(option.field);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: draftField === option.field }}
                accessibilityLabel={`Search by ${option.label}`}
                testID={`search-field-${option.field}`}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    draftField === option.field ? styles.chipLabelSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={draftQuery}
            onChangeText={setDraftQuery}
            placeholder="Type words to search"
            placeholderTextColor={theme.colors.textPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={executeSearch}
            accessibilityLabel="Search text"
            testID="search-query-input"
          />
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={executeSearch}
              accessibilityRole="button"
              accessibilityLabel="Search"
              testID="search-submit-button"
            >
              <Text style={styles.primaryLabel}>Search</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={clearSearch}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              testID="search-clear-button"
            >
              <Text style={styles.secondaryLabel}>Clear</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.results} testID="search-results">
          {!hasSubmitted ? (
            <Text style={styles.hint} testID="search-idle-hint">
              Type something, then tap Search.
            </Text>
          ) : null}
          {hasSubmitted && searchQuery.isLoading ? (
            <View style={styles.centered} accessibilityLabel="Loading search results">
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null}
          {hasSubmitted && searchQuery.isError ? (
            <View style={styles.centered}>
              <Text style={styles.error} testID="search-error">
                {toUserFacingMessage(searchQuery.error)}
              </Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  void searchQuery.refetch();
                }}
                accessibilityRole="button"
                accessibilityLabel="Try again"
                testID="search-retry-button"
              >
                <Text style={styles.primaryLabel}>Try again</Text>
              </Pressable>
            </View>
          ) : null}
          {hasSubmitted && searchQuery.isSuccess ? (
            <FlatList
              data={books}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CatalogBookRow
                  book={item}
                  onPress={(bookId) => {
                    router.push(`/(app)/books/${bookId}`);
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={
                books.length === 0 ? styles.emptyContent : styles.listContent
              }
              ListHeaderComponent={
                total > 0 ? (
                  <Text style={styles.count} testID="search-result-count">
                    {`${total} book${total === 1 ? '' : 's'}`}
                  </Text>
                ) : null
              }
              ListEmptyComponent={
                <Text style={styles.empty} testID="search-empty">
                  No books matched. Try different words.
                </Text>
              }
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  chipLabelSelected: {
    color: theme.colors.onPrimary,
  },
  input: {
    minHeight: theme.controlMinHeight,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.control,
    paddingHorizontal: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
    flex: 1,
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 96,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
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
});
