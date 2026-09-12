import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import { CollectionListRow } from '@/features/collections/components/collection-list-row';
import { useDiscoveryCollections } from '@/features/collections/hooks/use-discovery-collections';
import { theme } from '@/theme/theme';
import { EmptyState } from '@/ui/feedback/empty-state';
import { ErrorState } from '@/ui/feedback/error-state';
import { BackHeader } from '@/ui/primitives/back-header';
import { Skeleton } from '@/ui/primitives/skeleton';

const PAGE_SIZE = 20;

/**
 * Curated collections list. Opens collection detail for a selected shelf.
 */
export function CollectionsScreen(): JSX.Element {
  const collectionsQuery = useDiscoveryCollections({ limit: PAGE_SIZE, offset: 0 });

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="collections-screen"
    >
      <BackHeader
        title=""
        backTestID="collections-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/home');
        }}
      />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header" testID="collections-title">
          Collections
        </Text>
        <Text style={styles.body}>Curated sets of stories to explore</Text>
      </View>
      <View style={styles.results} testID="collections-list">
        {collectionsQuery.isLoading ? (
          <View style={styles.loadingBlock} accessibilityLabel="Loading collections">
            <Skeleton height={210} width="100%" radius={theme.radii.xl} />
            <Skeleton height={210} width="100%" radius={theme.radii.xl} />
          </View>
        ) : null}
        {collectionsQuery.isError ? (
          <ErrorState
            description={toUserFacingMessage(collectionsQuery.error)}
            onRetry={() => {
              void collectionsQuery.refetch();
            }}
            retryLabel="Try again"
            retryTestID="collections-retry-button"
            testID="collections-error"
          />
        ) : null}
        {collectionsQuery.isSuccess ? (
          <FlatList
            data={collectionsQuery.data.collections}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CollectionListRow
                collection={item}
                onPress={(collectionId) => {
                  router.push(`/(app)/collections/${collectionId}` as Href);
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={
              collectionsQuery.data.collections.length === 0
                ? styles.emptyContent
                : styles.listContent
            }
            ListHeaderComponent={
              collectionsQuery.data.total > 0 ? (
                <Text style={styles.count} testID="collections-count">
                  {`${collectionsQuery.data.total} collection${
                    collectionsQuery.data.total === 1 ? '' : 's'
                  }`}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                title="No collections yet. Check back after editors add shelves."
                description="Curated sets of stories will appear here when they are published."
                testID="collections-empty"
              />
            }
          />
        ) : null}
      </View>
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
  return 'Could not load collections.';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  results: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingBlock: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xs,
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
    height: theme.spacing.md,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
});
