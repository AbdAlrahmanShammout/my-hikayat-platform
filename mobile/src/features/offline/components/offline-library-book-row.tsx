import { Lock } from 'lucide-react-native';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OfflineLeaseExpiryLabel } from '@/features/offline/components/offline-lease-expiry-label';
import { useOfflineLeaseExpiryPresentation } from '@/features/offline/hooks/use-offline-lease-expiry-presentation';
import { resolveOfflineCoverUri } from '@/features/offline/lib/resolve-offline-cover-uri';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { theme } from '@/theme/theme';
import { BookCover } from '@/ui/primitives/book-cover';
import { Icon } from '@/ui/primitives/icon';

type OfflineLibraryBookRowProps = {
  readonly manifest: OfflineBookManifest;
  readonly isRemoving: boolean;
  readonly onOpen: () => void;
  readonly onRequestRemove: () => void;
};

const COVER_WIDTH = 52;
const COVER_HEIGHT = 78;

/**
 * One downloaded package: cover, author, lease chip, and Read / Remove on the right.
 * Read stays hidden when the lease is locked. Open-path validation remains fail-closed.
 */
export function OfflineLibraryBookRow({
  manifest,
  isRemoving,
  onOpen,
  onRequestRemove,
}: OfflineLibraryBookRowProps): JSX.Element {
  const presentation = useOfflineLeaseExpiryPresentation(manifest.offlineLease?.expiresAt);
  const isLocked: boolean =
    presentation?.state === 'expired' ||
    presentation?.state === 'clock_rollback' ||
    presentation?.state === 'unavailable';
  const coverUri: string | null = resolveOfflineCoverUri(manifest.coverFileName);
  const authorName: string | null = coerceAuthorName(manifest.authorName);
  return (
    <View style={styles.row} testID={`library-offline-book-${manifest.bookId}`}>
      <View style={styles.coverSlot}>
        <BookCover
          title={manifest.title}
          coverUri={coverUri}
          size="sm"
          isLocked={isLocked}
        />
        {isLocked ? (
          <View style={styles.lockOverlay} pointerEvents="none" accessibilityElementsHidden>
            <Icon icon={Lock} color={theme.colors.textOnDark} size="md" />
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {manifest.title}
        </Text>
        {authorName !== null ? (
          <Text style={styles.author} numberOfLines={1} testID={`library-offline-author-${manifest.bookId}`}>
            {authorName}
          </Text>
        ) : null}
        <OfflineLeaseExpiryLabel
          expiresAt={manifest.offlineLease?.expiresAt}
          appearance="chip"
          testID={`library-offline-lease-${manifest.bookId}`}
        />
      </View>
      <View style={styles.actions}>
        {isLocked ? null : (
          <Pressable
            style={styles.readButton}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={`Read ${manifest.title}`}
            testID={`library-offline-open-${manifest.bookId}`}
          >
            <Text style={styles.readLabel}>Read</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.removeButton}
          onPress={onRequestRemove}
          disabled={isRemoving}
          accessibilityRole="button"
          accessibilityState={{ disabled: isRemoving, busy: isRemoving }}
          accessibilityLabel={`Remove download for ${manifest.title}`}
          testID={`library-offline-remove-${manifest.bookId}`}
        >
          <Text style={styles.removeLabel}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

function coerceAuthorName(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed: string = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  coverSlot: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.scale.xs,
  },
  title: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  author: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  actions: {
    gap: theme.spacing.sm,
    alignItems: 'stretch',
  },
  readButton: {
    minHeight: 36,
    minWidth: 72,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  readLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnBrand,
  },
  removeButton: {
    minHeight: 36,
    minWidth: 72,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  removeLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
});
