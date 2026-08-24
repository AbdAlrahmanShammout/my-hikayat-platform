import { router } from 'expo-router';
import type { JSX } from 'react';
import { StyleSheet, Text } from 'react-native';
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
});
