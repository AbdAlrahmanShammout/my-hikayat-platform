import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
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
import { CatalogBookCover } from '@/features/catalog/components/catalog-book-cover';
import { parseBookIdParam } from '@/features/catalog/lib/parse-book-id-param';
import { useOfflineBookActions } from '@/features/offline/hooks/use-offline-book-actions';
import { useOfflinePackage } from '@/features/offline/hooks/use-offline-packages';
import { useConnectivity } from '@/native/connectivity/use-connectivity';
import { findReadingProgress } from '@/features/reader/lib/find-reading-progress';
import { theme } from '@/theme/theme';

/**
 * Catalog book detail. Opens the reading shell; Continue reading when progress exists.
 */
export function BookDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ bookId: string }>();
  const bookId: number | null = parseBookIdParam(params.bookId);
  const bookQuery = useCatalogBook(bookId);
  const offlinePackage = useOfflinePackage(bookId);
  const offlineActions = useOfflineBookActions(bookId);
  const { isOnline } = useConnectivity();
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const progressQuery = useQuery({
    queryKey: ['reader', 'progress', bookId],
    queryFn: async () => {
      if (bookId === null) {
        return null;
      }
      return findReadingProgress(bookId);
    },
    enabled: bookId !== null,
    staleTime: 0,
  });

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
  const hasProgress: boolean = progressQuery.data !== null && progressQuery.data !== undefined;
  const readLabel: string = hasProgress ? 'Continue reading' : 'Read';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BackButton />
      <CatalogBookCover cover={book.cover} title={book.title} size="detail" />
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
      {!isOnline ? (
        <Text style={styles.note} testID="book-detail-offline-banner">
          You are offline. Downloaded books still open. New downloads need the internet.
        </Text>
      ) : null}
      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          router.push(`/(app)/books/read/${book.id}` as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel={readLabel}
        testID="book-detail-read-button"
      >
        <Text style={styles.primaryLabel}>{readLabel}</Text>
      </Pressable>
      {offlinePackage.isDownloaded ? (
        <Pressable
          style={styles.secondaryButton}
          disabled={offlineActions.isRemoving}
          onPress={() => {
            void offlineActions
              .remove()
              .then(async () => {
                setOfflineMessage('Download removed from this device.');
                await offlinePackage.invalidate();
              })
              .catch((error: unknown) => {
                setOfflineMessage(
                  error instanceof Error ? error.message : 'Could not remove the download.',
                );
              });
          }}
          accessibilityRole="button"
          accessibilityLabel="Remove offline download"
          testID="book-detail-remove-offline-button"
        >
          {offlineActions.isRemoving ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.secondaryLabel}>Remove offline download</Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          style={styles.secondaryButton}
          disabled={offlineActions.isDownloading || !isOnline}
          onPress={() => {
            void offlineActions.download().then((message: string | null) => {
              setOfflineMessage(message);
              void offlinePackage.invalidate();
            });
          }}
          accessibilityRole="button"
          accessibilityLabel="Download for offline reading"
          testID="book-detail-download-offline-button"
        >
          {offlineActions.isDownloading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.secondaryLabel}>
              {isOnline ? 'Download for offline' : 'Connect to download'}
            </Text>
          )}
        </Pressable>
      )}
      {offlineActions.isDownloading ? (
        <Text style={styles.note} testID="book-detail-download-progress">
          {offlineActions.downloadProgressLabel ?? 'Downloading…'}
        </Text>
      ) : null}
      {offlineMessage !== null ? (
        <Text style={styles.note} testID="book-detail-offline-message">
          {offlineMessage}
        </Text>
      ) : null}
      <Text style={styles.note} testID="book-detail-resume-note">
        {hasProgress
          ? 'You will pick up where you left off.'
          : 'Reading opens in the layout-correct engine for this book.'}
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
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  meta: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 160,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  backLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
