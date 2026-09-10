import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState, type JSX } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBookIdParam } from '@/features/catalog/lib/parse-book-id-param';
import { saveOfflineReadingProgressBestEffort } from '@/features/offline/lib/save-offline-reading-progress-best-effort';
import { FixedLayoutReaderEngine } from '@/features/reader/components/fixed-layout-reader-engine';
import { ReflowableReaderEngine } from '@/features/reader/components/reflowable-reader-engine';
import { endReadingSession } from '@/features/reader/api/end-reading-session';
import { useOpenReadingShell } from '@/features/reader/hooks/use-open-reading-shell';
import { mapOpenReaderError } from '@/features/reader/lib/map-open-reader-error';
import {
  toEndSessionBody,
  toSaveProgressBody,
  type ReadingPositionSnapshot,
} from '@/features/reader/lib/reading-position';
import { saveReadingProgressBestEffort } from '@/features/reader/lib/save-reading-progress-best-effort';
import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';

/**
 * Opens a reading session and routes to a layout-specific engine.
 */
export function OpenReaderScreen(): JSX.Element {
  const params = useLocalSearchParams<{ bookId: string }>();
  const bookId: number | null = parseBookIdParam(params.bookId);
  const openQuery = useOpenReadingShell(bookId);
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const positionRef = useRef<ReadingPositionSnapshot | null>(null);
  const isOfflinePackageRef = useRef<boolean>(false);
  const handlePositionChange = useCallback(
    (position: ReadingPositionSnapshot): void => {
      positionRef.current = position;
      if (bookId === null || !isOfflinePackageRef.current) {
        return;
      }
      void saveOfflineReadingProgressBestEffort({
        bookId,
        position,
      });
    },
    [bookId],
  );

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
        {mapped.kind === 'entitlement_denied' ? (
          <Button
            label="Go to Subscribe"
            onPress={() => {
              router.replace('/(app)/(tabs)/profile' as Href);
            }}
            isFullWidth={false}
            accessibilityLabel="Go to subscription on Profile"
            testID="reader-subscribe-profile-button"
          />
        ) : (
          <Button
            label="Try again"
            onPress={() => {
              void openQuery.refetch();
            }}
            isFullWidth={false}
            accessibilityLabel="Try again"
            testID="reader-retry-button"
          />
        )}
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
  const isOfflinePackage: boolean = opened.isOfflinePackage === true;
  isOfflinePackageRef.current = isOfflinePackage;

  async function executeClose(): Promise<void> {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    const position: ReadingPositionSnapshot | null = positionRef.current;
    if (isOfflinePackage) {
      if (position !== null) {
        await saveOfflineReadingProgressBestEffort({
          bookId: openedBookId,
          position,
        });
      }
      setIsClosing(false);
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(`/(app)/books/${openedBookId}` as Href);
      return;
    }
    if (position !== null) {
      await saveReadingProgressBestEffort({
        bookId: openedBookId,
        body: toSaveProgressBody(position),
      });
    }
    try {
      await endReadingSession({
        bookId: openedBookId,
        sessionId: openedSessionId,
        body: position === null ? {} : toEndSessionBody(position),
      });
    } catch {
      // Closing the UI still returns home even if end-session fails.
    } finally {
      await queryClient.invalidateQueries({ queryKey: ['reader', 'sync'] });
      await queryClient.invalidateQueries({
        queryKey: ['reader', 'progress', openedBookId],
      });
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
        <ReflowableReaderEngine
          book={opened.book}
          session={opened.session}
          deliveryGrant={opened.deliveryGrant}
          onPositionChange={handlePositionChange}
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
      <FixedLayoutReaderEngine
        book={opened.book}
        session={opened.session}
        deliveryGrant={opened.deliveryGrant}
        onPositionChange={handlePositionChange}
        onClose={() => {
          void executeClose();
        }}
      />
    </SafeAreaView>
  );
}

function CloseWithoutSession(): JSX.Element {
  return (
    <Button
      label="Back"
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/(app)/(tabs)/home');
      }}
      variant="secondary"
      isFullWidth={false}
      accessibilityLabel="Back"
      testID="reader-back-button"
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
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
});
