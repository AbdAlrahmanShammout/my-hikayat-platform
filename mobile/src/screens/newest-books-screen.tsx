import { router } from 'expo-router';
import type { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { CatalogBookList } from '@/features/catalog/components/catalog-book-list';
import { theme } from '@/theme/theme';
import { BackHeader } from '@/ui/primitives/back-header';

/**
 * Newest catalog list opened from Home See all. Not Collections.
 */
export function NewestBooksScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']} testID="newest-books-screen">
      <BackHeader
        title="New in My Hikayat"
        titleTestID="newest-books-title"
        backTestID="newest-books-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/home');
        }}
      />
      <CatalogBookList
        variant="newest"
        onOpenBook={(bookId) => {
          router.push(`/(app)/books/${bookId}`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
});
