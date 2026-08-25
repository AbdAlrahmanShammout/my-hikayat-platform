import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOfflineBookActions } from '@/features/offline/hooks/use-offline-book-actions';
import { useOfflinePackages } from '@/features/offline/hooks/use-offline-packages';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { theme } from '@/theme/theme';

/**
 * Library tab: downloaded encrypted books available for offline reading.
 */
export function LibraryScreen(): JSX.Element {
  const offline = useOfflinePackages();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-library-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="shell-library-title">
          My books
        </Text>
        <Text style={styles.lead}>
          Downloaded books stay encrypted on this device until you remove them.
        </Text>
        {offline.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} testID="library-offline-loading" />
        ) : null}
        {offline.isError ? (
          <View style={styles.block}>
            <Text style={styles.error}>Could not load downloaded books.</Text>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                void offline.refetch();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry library"
              testID="library-offline-retry"
            >
              <Text style={styles.secondaryLabel}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
        {!offline.isLoading && !offline.isError && offline.packages.length === 0 ? (
          <Text style={styles.body} testID="library-offline-empty">
            No downloads yet. Open a book and choose Download for offline on its detail page.
          </Text>
        ) : null}
        {offline.packages.map((entry) => (
          <OfflineBookRow key={entry.bookId} manifest={entry} onChanged={() => offline.refetch()} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function OfflineBookRow(input: {
  readonly manifest: OfflineBookManifest;
  readonly onChanged: () => Promise<void>;
}): JSX.Element {
  const actions = useOfflineBookActions(input.manifest.bookId);
  const [message, setMessage] = useState<string | null>(null);
  const layoutLabel: string =
    input.manifest.layoutType === 'reflowable' ? 'Reflowable' : 'Fixed layout';
  return (
    <View style={styles.row} testID={`library-offline-book-${input.manifest.bookId}`}>
      <Text style={styles.rowTitle}>{input.manifest.title}</Text>
      <Text style={styles.meta}>{layoutLabel}</Text>
      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            router.push(`/(app)/books/read/${input.manifest.bookId}` as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Open ${input.manifest.title}`}
          testID={`library-offline-open-${input.manifest.bookId}`}
        >
          <Text style={styles.primaryLabel}>Open</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          disabled={actions.isRemoving}
          onPress={() => {
            void actions
              .remove()
              .then(async () => {
                setMessage('Download removed from this device.');
                await input.onChanged();
              })
              .catch((error: unknown) => {
                setMessage(
                  error instanceof Error ? error.message : 'Could not remove the download.',
                );
              });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Remove download for ${input.manifest.title}`}
          testID={`library-offline-remove-${input.manifest.bookId}`}
        >
          {actions.isRemoving ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.secondaryLabel}>Remove</Text>
          )}
        </Pressable>
      </View>
      {message !== null ? <Text style={styles.note}>{message}</Text> : null}
    </View>
  );
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
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  block: {
    gap: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  rowTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
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
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
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
