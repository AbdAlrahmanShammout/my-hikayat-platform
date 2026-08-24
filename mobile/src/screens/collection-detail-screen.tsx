import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import { CatalogBookRow } from '@/features/catalog/components/catalog-book-row';
import { useDiscoveryCollection } from '@/features/collections/hooks/use-discovery-collection';
import { parseCollectionIdParam } from '@/features/collections/lib/parse-collection-id-param';
import { theme } from '@/theme/theme';

/**
 * One curated collection with books in backend editorial order.
 */
export function CollectionDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ collectionId: string }>();
  const collectionId: number | null = parseCollectionIdParam(params.collectionId);
  const collectionQuery = useDiscoveryCollection(collectionId);

  if (collectionId === null) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error} testID="collection-detail-invalid">
          That collection link is not valid.
        </Text>
        <BackButton />
      </SafeAreaView>
    );
  }

  if (collectionQuery.isLoading) {
    return (
      <SafeAreaView
        style={styles.centered}
        edges={['top', 'left', 'right', 'bottom']}
        accessibilityLabel="Loading collection"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (collectionQuery.isError) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error} testID="collection-detail-error">
          {toUserFacingMessage(collectionQuery.error)}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            void collectionQuery.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          testID="collection-detail-retry-button"
        >
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
        <BackButton />
      </SafeAreaView>
    );
  }

  const collection = collectionQuery.data;
  if (collection === undefined) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error} testID="collection-detail-missing">
          Collection not found.
        </Text>
        <BackButton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="collection-detail-screen"
    >
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title} accessibilityRole="header" testID="collection-detail-title">
          {collection.title}
        </Text>
        <Text style={styles.body} testID="collection-detail-book-count">
          {`${collection.books.length} book${collection.books.length === 1 ? '' : 's'}`}
        </Text>
      </View>
      <FlatList
        style={styles.list}
        data={collection.books}
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
          collection.books.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.empty} testID="collection-detail-empty-books">
            This collection has no published books right now.
          </Text>
        }
        testID="collection-detail-books"
      />
    </SafeAreaView>
  );
}

function BackButton(): JSX.Element {
  return (
    <Pressable
      style={styles.backButton}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/(app)/collections' as Href);
      }}
      accessibilityRole="button"
      accessibilityLabel="Back"
      testID="collection-detail-back-button"
    >
      <Text style={styles.backLabel}>Back</Text>
    </Pressable>
  );
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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
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
