import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineDownloadingBookRow } from '@/features/offline/components/offline-downloading-book-row';
import { OfflineLibraryBookRow } from '@/features/offline/components/offline-library-book-row';
import { RemoveOfflineDownloadSheet } from '@/features/offline/components/remove-offline-download-sheet';
import { useIsClockRollbackDetected } from '@/features/offline/hooks/use-is-clock-rollback-detected';
import { useOfflineBookActions } from '@/features/offline/hooks/use-offline-book-actions';
import { useOfflineDownloadProgress } from '@/features/offline/hooks/use-offline-download-progress';
import { useOfflinePackages } from '@/features/offline/hooks/use-offline-packages';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { useConnectivity } from '@/native/connectivity/use-connectivity';
import { theme } from '@/theme/theme';
import { EmptyState } from '@/ui/feedback/empty-state';
import { ErrorState } from '@/ui/feedback/error-state';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Library tab: downloaded encrypted books available for offline reading.
 */
export function LibraryScreen(): JSX.Element {
  const offline = useOfflinePackages();
  const { isOnline } = useConnectivity();
  const [removeTarget, setRemoveTarget] = useState<OfflineBookManifest | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const clockRollback = useIsClockRollbackDetected();
  const downloadProgress = useOfflineDownloadProgress();
  const actions = useOfflineBookActions(removeTarget?.bookId ?? null);
  const packageCount: number = offline.packages.length;
  const isClockRollbackDetected: boolean = clockRollback.isClockRollbackDetected;
  const showCountBanner: boolean =
    !offline.isLoading && !offline.isError && packageCount > 0 && !isClockRollbackDetected;
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-library-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="shell-library-title">
          My Books
        </Text>
        <Text style={styles.lead}>
          Downloads are leased and stay encrypted on this device. Each book shows when offline
          access ends.
        </Text>
        {!isOnline ? (
          <View style={styles.offlineBanner} testID="library-offline-banner">
            <Text style={styles.offlineBannerText}>
              You are offline. You can still open downloaded books.
            </Text>
          </View>
        ) : null}
        {isClockRollbackDetected && packageCount > 0 ? (
          <View style={styles.clockBanner} testID="library-clock-banner">
            <Text style={styles.clockTitle}>Device time changed</Text>
            <Text style={styles.clockBody}>
              Connect to the internet to verify your offline access.
            </Text>
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => {
                void clockRollback.refetch();
                void offline.refetch();
              }}
              accessibilityLabel="Try again to verify offline access"
              testID="library-clock-retry"
            />
          </View>
        ) : null}
        {showCountBanner ? (
          <View style={styles.countBanner}>
            <Text style={styles.countBannerText}>{formatAvailableOfflineCount(packageCount)}</Text>
          </View>
        ) : null}
        {offline.isLoading ? (
          <View style={styles.loadingBlock} testID="library-offline-loading">
            <LibraryRowSkeleton />
            <LibraryRowSkeleton />
          </View>
        ) : null}
        {offline.isError ? (
          <ErrorState
            description="Could not load downloaded books."
            retryLabel="Try again"
            onRetry={() => {
              void offline.refetch();
            }}
            retryTestID="library-offline-retry"
          />
        ) : null}
        {!offline.isLoading && !offline.isError && packageCount === 0 && downloadProgress === null ? (
          <EmptyState
            title="No downloads yet"
            description="Open a book and choose Download for offline on its detail page."
            actionLabel="Browse library"
            onAction={() => {
              router.push('/(app)/(tabs)/home' as Href);
            }}
            testID="library-offline-empty"
          />
        ) : null}
        {downloadProgress !== null &&
        !offline.packages.some((entry) => entry.bookId === downloadProgress.bookId) ? (
          <OfflineDownloadingBookRow progress={downloadProgress} />
        ) : null}
        {offline.packages.map((entry) => (
          <OfflineLibraryBookRow
            key={entry.bookId}
            manifest={entry}
            isRemoving={removeTarget?.bookId === entry.bookId && actions.isRemoving}
            onOpen={() => {
              router.push(`/(app)/books/read/${entry.bookId}` as Href);
            }}
            onRequestRemove={() => {
              setRemoveError(null);
              setRemoveTarget(entry);
            }}
          />
        ))}
        {packageCount > 0 ? (
          <Text style={styles.footer}>
            Downloaded books are authorized for offline reading. Authorization may expire.
          </Text>
        ) : null}
        {removeError !== null ? <Text style={styles.error}>{removeError}</Text> : null}
      </ScrollView>
      <RemoveOfflineDownloadSheet
        bookTitle={removeTarget?.title ?? null}
        isRemoving={actions.isRemoving}
        onConfirm={() => {
          void actions
            .remove()
            .then(async () => {
              setRemoveTarget(null);
              await offline.refetch();
            })
            .catch((error: unknown) => {
              setRemoveError(
                error instanceof Error ? error.message : 'Could not remove the download.',
              );
            });
        }}
        onCancel={() => {
          if (!actions.isRemoving) {
            setRemoveTarget(null);
          }
        }}
      />
    </SafeAreaView>
  );
}

function LibraryRowSkeleton(): JSX.Element {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={52} height={78} radius={theme.radii.sm} />
      <View style={styles.skeletonInfo}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="40%" />
        <Skeleton height={14} width="55%" />
      </View>
    </View>
  );
}

function formatAvailableOfflineCount(count: number): string {
  if (count === 1) {
    return '1 book available offline';
  }
  return `${count} books available offline`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  offlineBanner: {
    backgroundColor: theme.colors.infoBg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.info,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  offlineBannerText: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.info,
  },
  clockBanner: {
    backgroundColor: theme.colors.warningBg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.scale.xs,
  },
  clockTitle: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.warning,
  },
  clockBody: {
    ...theme.typography.label,
    color: theme.colors.warning,
  },
  countBanner: {
    backgroundColor: theme.colors.successBg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  countBannerText: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.success,
  },
  loadingBlock: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  skeletonInfo: {
    flex: 1,
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  footer: {
    ...theme.typography.label,
    color: theme.colors.textFaint,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
});
