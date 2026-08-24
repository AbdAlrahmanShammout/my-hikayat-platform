import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiError } from '@/api/api-error';
import { useCatalogBook } from '@/features/catalog/hooks/use-catalog-book';
import { parseBookIdParam } from '@/features/catalog/lib/parse-book-id-param';
import { theme } from '@/theme/theme';

/**
 * Catalog book detail. Opens the R3 reading shell when the reader taps Read.
 */
export function BookDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ bookId: string }>();
  const bookId: number | null = parseBookIdParam(params.bookId);
  const bookQuery = useCatalogBook(bookId);

  if (bookId === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>That book link is not valid.</Text>
        <BackButton />
      </View>
    );
  }

  if (bookQuery.isLoading) {
    return (
      <View style={styles.centered} accessibilityLabel="Loading book">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (bookQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{toUserFacingMessage(bookQuery.error)}</Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void bookQuery.refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.secondaryLabel}>Try again</Text>
        </Pressable>
        <BackButton />
      </View>
    );
  }

  const book = bookQuery.data;
  if (book === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Book not found.</Text>
        <BackButton />
      </View>
    );
  }

  const categoryNames: string = book.categories.map((category) => category.name).join(', ');
  const layoutLabel: string =
    book.layoutType === 'reflowable'
      ? 'Reflowable'
      : book.layoutType === 'fixed_layout'
        ? 'Fixed layout'
        : 'Layout not ready';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BackButton />
      <Text style={styles.title} accessibilityRole="header">
        {book.title}
      </Text>
      {categoryNames !== '' ? <Text style={styles.meta}>{categoryNames}</Text> : null}
      {book.owner?.email !== undefined ? (
        <Text style={styles.meta}>{`By ${book.owner.email}`}</Text>
      ) : null}
      <Text style={styles.meta} testID="book-detail-layout-type">
        {layoutLabel}
      </Text>
      <Text style={styles.body}>{book.description}</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          router.push(`/(app)/books/read/${book.id}` as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel="Read book"
        testID="book-detail-read-button"
      >
        <Text style={styles.primaryLabel}>Read</Text>
      </Pressable>
      <Text style={styles.note}>
        Reading opens a placeholder engine in this STEP. Full page rendering comes next.
      </Text>
    </ScrollView>
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
        router.replace('/(app)/(tabs)/home');
      }}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <Text style={styles.backLabel}>Back</Text>
    </Pressable>
  );
}

function toUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return 'That book is not available.';
    }
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return 'Could not load this book.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  note: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  backLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
  primaryButton: {
    marginTop: theme.spacing.md,
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 160,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
