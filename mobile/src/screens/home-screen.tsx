import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogBookList } from '@/features/catalog/components/catalog-book-list';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Signed-in home tab: catalog browse (partial R2 present; not an R1 completion criterion).
 */
export function HomeScreen(): JSX.Element {
  const { user } = useSession();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-home-screen">
      <Text style={styles.title} accessibilityRole="header" testID="shell-home-title">
        Home
      </Text>
      <Text style={styles.body}>
        Hello{user !== null ? `, ${user.email}` : ''}. Pick a book to learn more.
      </Text>
      <Pressable
        style={styles.searchButton}
        onPress={() => {
          router.push('/(app)/search');
        }}
        accessibilityRole="button"
        accessibilityLabel="Search books"
        testID="home-search-button"
      >
        <Text style={styles.searchButtonLabel}>Search books</Text>
      </Pressable>
      <Pressable
        style={styles.searchButton}
        onPress={() => {
          router.push('/(app)/collections' as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel="Browse collections"
        testID="home-collections-button"
      >
        <Text style={styles.searchButtonLabel}>Collections</Text>
      </Pressable>
      <CatalogBookList
        onOpenBook={(bookId) => {
          router.push(`/(app)/books/${bookId}`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  searchButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  searchButtonLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
