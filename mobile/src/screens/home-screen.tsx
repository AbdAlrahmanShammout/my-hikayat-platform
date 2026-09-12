import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeTrialDiscoveryCard } from '@/features/billing/components/home-trial-discovery-card';
import { SubscriptionExpiryBanner } from '@/features/billing/components/subscription-expiry-banner';
import { CatalogBookList } from '@/features/catalog/components/catalog-book-list';
import { HomeNewBooksSection } from '@/features/catalog/components/home-new-books-section';
import { CollectionListRow } from '@/features/collections/components/collection-list-row';
import { useDiscoveryCollections } from '@/features/collections/hooks/use-discovery-collections';
import { resolveHomeGreeting } from '@/features/home/lib/resolve-home-greeting';
import { ContinueReadingList } from '@/features/reader/components/continue-reading-list';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

const HOME_COLLECTION_LIMIT = 20;

/**
 * Signed-in home tab: expiry awareness, trial discovery, Continue Reading, and catalog browse.
 */
export function HomeScreen(): JSX.Element {
  const { user } = useSession();
  const greeting = resolveHomeGreeting({
    displayName: user?.displayName,
    email: user?.email ?? '—',
  });
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID="shell-home-screen">
      <CatalogBookList
        onOpenBook={(bookId) => {
          router.push(`/(app)/books/${bookId}`);
        }}
        header={<HomeDiscoveryHeader phrase={greeting.phrase} name={greeting.name} />}
      />
    </SafeAreaView>
  );
}

function HomeDiscoveryHeader(input: {
  readonly phrase: string;
  readonly name: string;
}): JSX.Element {
  return (
    <View style={styles.header}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text style={styles.greeting} accessibilityRole="header" testID="shell-home-title">
            {input.phrase}
          </Text>
          <Text style={styles.identity} numberOfLines={1} testID="shell-home-greeting-name">
            {input.name}
          </Text>
        </View>
        <Pressable
          style={styles.searchIconButton}
          onPress={() => {
            router.push('/(app)/search');
          }}
          accessibilityRole="button"
          accessibilityLabel="Search books"
          testID="home-search-button"
        >
          <SearchIcon />
        </Pressable>
      </View>
      <SubscriptionExpiryBanner placement="home" />
      <HomeTrialDiscoveryCard />
      <ContinueReadingList
        onContinue={(bookId) => {
          router.push(`/(app)/books/read/${bookId}` as Href);
        }}
      />
      <HomeCollectionsShelf />
      <HomeNewBooksSection
        onOpenBook={(bookId) => {
          router.push(`/(app)/books/${bookId}`);
        }}
      />
    </View>
  );
}

function HomeCollectionsShelf(): JSX.Element {
  const collectionsQuery = useDiscoveryCollections({
    limit: HOME_COLLECTION_LIMIT,
    offset: 0,
  });
  const collections = collectionsQuery.data?.collections ?? [];
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Collections</Text>
        <Pressable
          onPress={() => {
            router.push('/(app)/collections' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel="Browse collections"
          testID="home-collections-button"
          hitSlop={8}
        >
          <Text style={styles.sectionAction}>All collections</Text>
        </Pressable>
      </View>
      {collectionsQuery.isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          <Skeleton width={160} height={150} radius={theme.radii.lg} />
          <Skeleton width={160} height={150} radius={theme.radii.lg} />
        </ScrollView>
      ) : null}
      {collectionsQuery.isError ? (
        <View style={styles.shelfState} testID="home-collections-error">
          <Text style={styles.shelfStateBody}>Could not load collections.</Text>
          <Button
            label="Try again"
            variant="secondary"
            isFullWidth={false}
            onPress={() => {
              void collectionsQuery.refetch();
            }}
            accessibilityLabel="Try loading collections again"
            testID="home-collections-retry"
          />
        </View>
      ) : null}
      {!collectionsQuery.isLoading && !collectionsQuery.isError && collections.length === 0 ? (
        <View style={styles.shelfState} testID="home-collections-empty">
          <Text style={styles.shelfStateBody}>No collections yet. Check back after editors add shelves.</Text>
        </View>
      ) : null}
      {!collectionsQuery.isLoading && !collectionsQuery.isError && collections.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          {collections.map((collection) => (
            <CollectionListRow
              key={collection.id}
              collection={collection}
              variant="shelf"
              onPress={(collectionId) => {
                router.push(`/(app)/collections/${collectionId}` as Href);
              }}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function SearchIcon(): JSX.Element {
  return (
    <View style={styles.searchIcon} accessibilityElementsHidden>
      <View style={styles.searchLens} />
      <View style={styles.searchHandle} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  greetingText: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    ...theme.typography.title,
    fontSize: theme.typography.scale['2xl'],
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  identity: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  searchIconButton: {
    width: theme.controlMinHeight,
    height: theme.controlMinHeight,
    borderRadius: theme.radii.full,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  searchLens: {
    width: 12,
    height: 12,
    borderRadius: theme.radii.full,
    borderWidth: 1.75,
    borderColor: theme.colors.textPrimary,
  },
  searchHandle: {
    position: 'absolute',
    width: 7,
    height: 1.75,
    backgroundColor: theme.colors.textPrimary,
    right: 0,
    bottom: 3,
    transform: [{ rotate: '45deg' }],
  },
  section: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  sectionAction: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  shelf: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  shelfState: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  shelfStateBody: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
});
