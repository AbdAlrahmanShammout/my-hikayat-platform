import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { formatSubscriptionDisplay } from '@/features/billing/lib/format-subscription-display';
import { formatTrialRemainingLabel } from '@/features/billing/lib/format-trial-remaining-label';
import { resolveReaderEntryCta } from '@/features/billing/lib/resolve-reader-entry-cta';
import { useCatalogBook } from '@/features/catalog/hooks/use-catalog-book';
import { parseBookIdParam } from '@/features/catalog/lib/parse-book-id-param';
import { resolveCatalogBookAttribution } from '@/features/catalog/lib/resolve-catalog-book-attribution';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import { OfflineLeaseExpiryLabel } from '@/features/offline/components/offline-lease-expiry-label';
import { RemoveOfflineDownloadSheet } from '@/features/offline/components/remove-offline-download-sheet';
import { useOfflineBookActions } from '@/features/offline/hooks/use-offline-book-actions';
import { useOfflinePackage } from '@/features/offline/hooks/use-offline-packages';
import { findReadingProgress } from '@/features/reader/lib/find-reading-progress';
import { useConnectivity } from '@/native/connectivity/use-connectivity';
import { theme } from '@/theme/theme';
import { ErrorState } from '@/ui/feedback/error-state';
import { BackHeader } from '@/ui/primitives/back-header';
import { BookCover } from '@/ui/primitives/book-cover';
import { Button } from '@/ui/primitives/button';
import { Pill } from '@/ui/primitives/pill';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Catalog book detail. Opens the reading shell; Continue reading when progress exists.
 * Primary CTA anticipates access via backend readingAccessState (display-only).
 */
export function BookDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ bookId: string }>();
  const bookId: number | null = parseBookIdParam(params.bookId);
  const bookQuery = useCatalogBook(bookId);
  const billing = useReaderSubscription();
  const offlinePackage = useOfflinePackage(bookId);
  const offlineActions = useOfflineBookActions(bookId);
  const { isOnline } = useConnectivity();
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [isRemoveConfirmVisible, setIsRemoveConfirmVisible] = useState<boolean>(false);
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
      <BookDetailStatus
        description="That book link is not valid."
      />
    );
  }
  if (bookQuery.isLoading) {
    return <BookDetailLoading />;
  }
  if (bookQuery.isError) {
    return (
      <BookDetailStatus
        description={toUserFacingMessage(bookQuery.error)}
        onRetry={() => {
          void bookQuery.refetch();
        }}
      />
    );
  }
  const book = bookQuery.data;
  if (book === undefined) {
    return <BookDetailStatus description="Book not found." />;
  }
  const attribution = resolveCatalogBookAttribution(book);
  const layoutLabel: string = resolveLayoutLabel(book.layoutType);
  const coverPresentation = resolveCatalogCoverPresentation(book.cover);
  const hasProgress: boolean = progressQuery.data !== null && progressQuery.data !== undefined;
  const entryCta = resolveReaderEntryCta({
    readingAccessState: billing.subscription?.readingAccessState,
    trialEligible: billing.subscription?.trialEligible,
    hasProgress,
    isOnline,
  });
  const trialRemainingLabel: string | null =
    billing.subscription?.readingAccessState === 'trial'
      ? formatTrialRemainingLabel(billing.subscription.trialEndsAt)
      : null;
  const cancelAccessNote: string | null =
    billing.subscription !== undefined
      ? formatSubscriptionDisplay(billing.subscription).cancelAccessNote
      : null;
  const coverTestID: string =
    coverPresentation.kind === 'placeholder'
      ? 'catalog-book-cover-placeholder'
      : 'catalog-book-cover';
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <BackHeader title="" onPressBack={navigateBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <BookCover
            title={book.title}
            coverUri={coverPresentation.kind === 'image' ? coverPresentation.url : null}
            size="detail"
            isDownloaded={offlinePackage.isDownloaded}
            isDownloading={offlineActions.isDownloading}
            testID={coverTestID}
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {book.title}
        </Text>
        {attribution.authorLine !== null ? (
          <Text style={styles.author} testID="book-detail-author">
            {attribution.authorLine}
          </Text>
        ) : null}
        {attribution.publisherLine !== null ? (
          <Text style={styles.publisher} testID="book-detail-publisher">
            {attribution.publisherLine}
          </Text>
        ) : null}
        <View style={styles.pills}>
          {book.categories.map((category) => (
            <Pill key={category.id} label={category.name} />
          ))}
          <Pill label={layoutLabel} variant="secondary" testID="book-detail-layout-type" />
        </View>
        <AccessNotice
          accessHint={entryCta.accessHint}
          trialRemainingLabel={trialRemainingLabel}
          cancelAccessNote={cancelAccessNote}
        />
        {!isOnline ? (
          <View style={[styles.notice, styles.noticeInfo]}>
            <Text style={styles.noticeInfoText} testID="book-detail-offline-banner">
              You are offline. Downloaded books still open. New downloads need the internet.
            </Text>
          </View>
        ) : null}
        <Button
          label={entryCta.label}
          onPress={() => {
            if (entryCta.kind === 'go_to_billing') {
              router.push('/(app)/(tabs)/profile' as Href);
              return;
            }
            router.push(`/(app)/books/read/${book.id}` as Href);
          }}
          accessibilityLabel={entryCta.label}
          testID="book-detail-read-button"
        />
        {offlinePackage.isDownloaded ? (
          <>
            <OfflineLeaseExpiryLabel
              expiresAt={offlinePackage.manifest?.offlineLease?.expiresAt}
              testID="book-detail-offline-lease"
            />
            <Button
              label="Remove offline download"
              variant="secondary"
              isLoading={offlineActions.isRemoving}
              onPress={() => {
                setIsRemoveConfirmVisible(true);
              }}
              accessibilityLabel="Remove offline download"
              testID="book-detail-remove-offline-button"
            />
          </>
        ) : (
          <Button
            label={isOnline ? 'Download for offline' : 'Connect to download'}
            variant="secondary"
            isDisabled={!isOnline}
            isLoading={offlineActions.isDownloading}
            onPress={() => {
              void offlineActions.download().then((message: string | null) => {
                setOfflineMessage(message);
                void offlinePackage.invalidate();
              });
            }}
            accessibilityLabel="Download for offline reading"
            testID="book-detail-download-offline-button"
          />
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
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>About this book</Text>
        <Text style={styles.body}>{book.description}</Text>
      </ScrollView>
      <RemoveOfflineDownloadSheet
        bookTitle={isRemoveConfirmVisible ? book.title : null}
        isRemoving={offlineActions.isRemoving}
        onConfirm={() => {
          void offlineActions
            .remove()
            .then(async () => {
              setIsRemoveConfirmVisible(false);
              setOfflineMessage('Download removed from this device.');
              await offlinePackage.invalidate();
            })
            .catch((error: unknown) => {
              setOfflineMessage(
                error instanceof Error ? error.message : 'Could not remove the download.',
              );
            });
        }}
        onCancel={() => {
          if (!offlineActions.isRemoving) {
            setIsRemoveConfirmVisible(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

function BookDetailLoading(): JSX.Element {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      accessibilityLabel="Loading book"
    >
      <BackHeader title="" onPressBack={navigateBack} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Skeleton width={160} height={240} radius={theme.radii.sm} />
        </View>
        <Skeleton height={28} width="70%" style={styles.centerSkeleton} />
        <Skeleton height={16} width="40%" style={styles.centerSkeleton} />
        <Skeleton height={theme.controlMinHeight} width="100%" />
        <Skeleton height={theme.controlMinHeight} width="100%" />
      </View>
    </SafeAreaView>
  );
}

function BookDetailStatus(input: {
  readonly description: string;
  readonly onRetry?: () => void;
}): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <BackHeader title="" onPressBack={navigateBack} />
      <ErrorState
        description={input.description}
        onRetry={input.onRetry}
        retryLabel="Try again"
      />
    </SafeAreaView>
  );
}

function AccessNotice(input: {
  readonly accessHint: string | null;
  readonly trialRemainingLabel: string | null;
  readonly cancelAccessNote: string | null;
}): JSX.Element | null {
  const tone = resolveAccessTone(input);
  if (input.accessHint === null && input.trialRemainingLabel === null && input.cancelAccessNote === null) {
    return null;
  }
  return (
    <View style={[styles.notice, { backgroundColor: tone.background }]}>
      {input.accessHint !== null ? (
        <Text style={[styles.noticeTitle, { color: tone.foreground }]} testID="book-detail-access-hint">
          {`Access: ${input.accessHint}`}
        </Text>
      ) : null}
      {input.trialRemainingLabel !== null ? (
        <Text style={[styles.noticeBody, { color: tone.foreground }]} testID="book-detail-trial-remaining">
          {input.trialRemainingLabel}
        </Text>
      ) : null}
      {input.cancelAccessNote !== null ? (
        <Text style={[styles.noticeBody, { color: tone.foreground }]}>{input.cancelAccessNote}</Text>
      ) : null}
    </View>
  );
}

function resolveAccessTone(input: {
  readonly accessHint: string | null;
  readonly trialRemainingLabel: string | null;
  readonly cancelAccessNote: string | null;
}): { readonly background: string; readonly foreground: string } {
  if (input.trialRemainingLabel !== null) {
    return { background: theme.colors.successBg, foreground: theme.colors.success };
  }
  if (input.cancelAccessNote !== null) {
    return { background: theme.colors.warningBg, foreground: theme.colors.warning };
  }
  if (input.accessHint === 'Free') {
    return { background: theme.colors.lockedBg, foreground: theme.colors.locked };
  }
  if (input.accessHint === 'Paid') {
    return { background: theme.colors.primaryDim, foreground: theme.colors.primary };
  }
  return { background: theme.colors.canvasWarm, foreground: theme.colors.textSecondary };
}

function resolveLayoutLabel(layoutType: string | null | undefined): string {
  if (layoutType === 'reflowable') {
    return 'Reflowable';
  }
  if (layoutType === 'fixed_layout') {
    return 'Fixed layout';
  }
  return 'Layout not ready';
}

function navigateBack(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/(tabs)/home');
}

function toUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.canvasWarm,
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale['2xl'],
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  author: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  publisher: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.scale.xs,
    marginTop: theme.spacing.xs,
  },
  notice: {
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.scale.xs,
  },
  noticeInfo: {
    backgroundColor: theme.colors.infoBg,
  },
  noticeTitle: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
  },
  noticeBody: {
    ...theme.typography.body,
  },
  noticeInfoText: {
    ...theme.typography.body,
    color: theme.colors.info,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  centerSkeleton: {
    alignSelf: 'center',
  },
});
