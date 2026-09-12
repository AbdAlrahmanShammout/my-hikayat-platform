import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { JSX } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { resolveCatalogBookAttribution } from '@/features/catalog/lib/resolve-catalog-book-attribution';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import { useDiscoveryCollection } from '@/features/collections/hooks/use-discovery-collection';
import { parseCollectionIdParam } from '@/features/collections/lib/parse-collection-id-param';
import { resolveCollectionAccentColor } from '@/features/collections/lib/resolve-collection-accent-color';
import { theme } from '@/theme/theme';
import { EmptyState } from '@/ui/feedback/empty-state';
import { ErrorState } from '@/ui/feedback/error-state';
import { BackHeader } from '@/ui/primitives/back-header';
import { BookCard } from '@/ui/primitives/book-card';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * One curated collection with books in backend editorial order.
 */
export function CollectionDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ collectionId: string }>();
  const collectionId: number | null = parseCollectionIdParam(params.collectionId);
  const collectionQuery = useDiscoveryCollection(collectionId);

  if (collectionId === null) {
    return (
      <CollectionDetailStatus
        description="That collection link is not valid."
        testID="collection-detail-invalid"
      />
    );
  }
  if (collectionQuery.isLoading) {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={['top', 'left', 'right', 'bottom']}
        accessibilityLabel="Loading collection"
      >
        <BackHeader title="" onPressBack={navigateBackToCollections} backTestID="collection-detail-back-button" />
        <View style={styles.header}>
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} width="30%" />
        </View>
        <View style={styles.gridSkeleton}>
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
          <Skeleton height={210} width="48%" radius={theme.radii.sm} />
        </View>
      </SafeAreaView>
    );
  }
  if (collectionQuery.isError) {
    return (
      <CollectionDetailStatus
        description={toUserFacingMessage(collectionQuery.error)}
        testID="collection-detail-error"
        onRetry={() => {
          void collectionQuery.refetch();
        }}
        retryTestID="collection-detail-retry-button"
      />
    );
  }
  const collection = collectionQuery.data;
  if (collection === undefined) {
    return (
      <CollectionDetailStatus
        description="Collection not found."
        testID="collection-detail-missing"
      />
    );
  }
  const accentColor: string | null = resolveCollectionAccentColor(collection.accentColor);
  const editorialDescription: string | null = coerceOptionalText(collection.description);
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="collection-detail-screen"
    >
      <BackHeader title="" onPressBack={navigateBackToCollections} backTestID="collection-detail-back-button" />
      <View
        style={[
          styles.header,
          accentColor !== null ? { backgroundColor: accentColor } : null,
        ]}
      >
        <Text style={styles.kicker}>Collection</Text>
        <Text style={styles.title} accessibilityRole="header" testID="collection-detail-title">
          {collection.title}
        </Text>
        {editorialDescription !== null ? (
          <Text style={styles.body} testID="collection-detail-description">
            {editorialDescription}
          </Text>
        ) : null}
        <Text style={styles.body} testID="collection-detail-book-count">
          {`${collection.books.length} book${collection.books.length === 1 ? '' : 's'}`}
        </Text>
      </View>
      <FlatList
        style={styles.list}
        data={collection.books}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <CollectionBookCard
              book={item}
              onPress={() => {
                router.push(`/(app)/books/${item.id}`);
              }}
            />
          </View>
        )}
        contentContainerStyle={
          collection.books.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="This collection has no published books right now."
            description="Check back after editors add stories to this shelf."
            testID="collection-detail-empty-books"
          />
        }
        testID="collection-detail-books"
      />
    </SafeAreaView>
  );
}

function coerceOptionalText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function CollectionBookCard(input: {
  readonly book: CatalogBook;
  readonly onPress: () => void;
}): JSX.Element {
  const attribution = resolveCatalogBookAttribution(input.book);
  const cover = resolveCatalogCoverPresentation(input.book.cover);
  return (
    <BookCard
      title={input.book.title}
      authorName={attribution.authorLine}
      coverUri={cover.kind === 'image' ? cover.url : null}
      variant="grid"
      onPress={input.onPress}
      accessibilityLabel={`Open ${input.book.title}`}
    />
  );
}

function CollectionDetailStatus(input: {
  readonly description: string;
  readonly testID: string;
  readonly onRetry?: () => void;
  readonly retryTestID?: string;
}): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <BackHeader title="" onPressBack={navigateBackToCollections} backTestID="collection-detail-back-button" />
      <ErrorState
        description={input.description}
        onRetry={input.onRetry}
        retryLabel="Try again"
        retryTestID={input.retryTestID}
        testID={input.testID}
      />
    </SafeAreaView>
  );
}

function navigateBackToCollections(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/collections' as Href);
}

function toUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return 'That collection is not available.';
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return 'Could not load this collection.';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.scale.xs,
    paddingBottom: theme.spacing.md,
  },
  kicker: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  list: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  column: {
    gap: theme.spacing.md,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
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
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});
