import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBookIdParam } from '@/features/catalog/lib/parse-book-id-param';
import { FixedLayoutReaderPlaceholder } from '@/features/reader/components/fixed-layout-reader-placeholder';
import { ReflowableReaderPlaceholder } from '@/features/reader/components/reflowable-reader-placeholder';
import { endReadingSession } from '@/features/reader/api/end-reading-session';
import { useOpenReadingShell } from '@/features/reader/hooks/use-open-reading-shell';
import { mapOpenReaderError } from '@/features/reader/lib/map-open-reader-error';
import { theme } from '@/theme/theme';

/**
 * Opens a reading session and routes to a layout-specific placeholder engine.
 */
export function OpenReaderScreen(): JSX.Element {
  const params = useLocalSearchParams<{ bookId: string }>();
  const bookId: number | null = parseBookIdParam(params.bookId);
  const openQuery = useOpenReadingShell(bookId);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  if (bookId === null) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error} testID="reader-invalid-book">
          That book link is not valid.
        </Text>
        <CloseWithoutSession />
      </SafeAreaView>
    );
  }

  if (openQuery.isLoading) {
    return (
      <SafeAreaView
        style={styles.centered}
        edges={['top', 'left', 'right', 'bottom']}
        accessibilityLabel="Opening book"
        testID="reader-opening"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.body}>Opening book…</Text>
      </SafeAreaView>
    );
  }

  if (openQuery.isError) {
    const mapped = mapOpenReaderError(openQuery.error);
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error} testID="reader-open-error">
          {mapped.message}
        </Text>
        {mapped.kind !== 'entitlement_denied' ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              void openQuery.refetch();
            }}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            testID="reader-retry-button"
          >
            <Text style={styles.primaryLabel}>Try again</Text>
          </Pressable>
        ) : null}
        <CloseWithoutSession />
      </SafeAreaView>
    );
  }

  const opened = openQuery.data;
  if (opened === undefined) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.error}>Could not open this book.</Text>
        <CloseWithoutSession />
      </SafeAreaView>
    );
  }

  const openedBookId: number = opened.book.id;
  const openedSessionId: number = opened.session.id;
  const hasDeliveryGrant: boolean = opened.deliveryGrant !== null;

  async function executeClose(): Promise<void> {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    try {
      await endReadingSession({
        bookId: openedBookId,
        sessionId: openedSessionId,
      });
    } catch {
      // Closing the UI still returns home even if end-session fails.
    } finally {
      setIsClosing(false);
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(`/(app)/books/${openedBookId}` as Href);
    }
  }

  if (opened.engine === 'reflowable') {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={['top', 'left', 'right', 'bottom']}
        testID="reader-shell-screen"
      >
        <ReflowableReaderPlaceholder
          book={opened.book}
          session={opened.session}
          hasDeliveryGrant={hasDeliveryGrant}
          onClose={() => {
            void executeClose();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="reader-shell-screen"
    >
      <FixedLayoutReaderPlaceholder
        book={opened.book}
        session={opened.session}
        hasDeliveryGrant={hasDeliveryGrant}
        onClose={() => {
          void executeClose();
        }}
      />
    </SafeAreaView>
  );
}

function CloseWithoutSession(): JSX.Element {
  return (
    <Pressable
      style={styles.secondaryButton}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/(app)/(tabs)/home');
      }}
      accessibilityRole="button"
      accessibilityLabel="Back"
      testID="reader-back-button"
    >
      <Text style={styles.secondaryLabel}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    minWidth: 160,
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
});
