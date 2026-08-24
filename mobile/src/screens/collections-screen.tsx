import { router, type Href } from 'expo-router';
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
import { CollectionListRow } from '@/features/collections/components/collection-list-row';
import { useDiscoveryCollections } from '@/features/collections/hooks/use-discovery-collections';
import { theme } from '@/theme/theme';

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
          testID="collections-back-button"
        >
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header" testID="collections-title">
          Collections
        </Text>
        <Text style={styles.body}>Editorial shelves picked for readers.</Text>
      </View>
      <View style={styles.results} testID="collections-list">
        {collectionsQuery.isLoading ? (
          <View style={styles.centered} accessibilityLabel="Loading collections">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : null}
        {collectionsQuery.isError ? (
          <View style={styles.centered}>
            <Text style={styles.error} testID="collections-error">
              {toUserFacingMessage(collectionsQuery.error)}
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                void collectionsQuery.refetch();
              }}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              testID="collections-retry-button"
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          </View>
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
              <Text style={styles.empty} testID="collections-empty">
                No collections yet. Check back after editors add shelves.
              </Text>
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
    backgroundColor: theme.colors.background,
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
  },
  results: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
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
