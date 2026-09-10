import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OfflineLeaseExpiryLabel } from '@/features/offline/components/offline-lease-expiry-label';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import { theme } from '@/theme/theme';
import { BookCover } from '@/ui/primitives/book-cover';
import { Button } from '@/ui/primitives/button';
import { Pill } from '@/ui/primitives/pill';

type OfflineLibraryBookRowProps = {
  readonly manifest: OfflineBookManifest;
  readonly isRemoving: boolean;
  readonly onOpen: () => void;
  readonly onRequestRemove: () => void;
};

/**
 * One downloaded package: title, layout, and lease only. No invented cover or author.
 */
export function OfflineLibraryBookRow({
  manifest,
  isRemoving,
  onOpen,
  onRequestRemove,
}: OfflineLibraryBookRowProps): JSX.Element {
  const layoutLabel: string = manifest.layoutType === 'reflowable' ? 'Reflowable' : 'Fixed layout';
  return (
    <View style={styles.row} testID={`library-offline-book-${manifest.bookId}`}>
      <View style={styles.top}>
        <BookCover title={manifest.title} coverUri={null} size="sm" isDownloaded />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {manifest.title}
          </Text>
          <Pill label={layoutLabel} variant="neutral" />
          <OfflineLeaseExpiryLabel
            expiresAt={manifest.offlineLease?.expiresAt}
            appearance="chip"
            testID={`library-offline-lease-${manifest.bookId}`}
          />
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label="Open"
            onPress={onOpen}
            accessibilityLabel={`Open ${manifest.title}`}
            testID={`library-offline-open-${manifest.bookId}`}
          />
        </View>
        <View style={styles.action}>
          <Button
            label="Remove"
            onPress={onRequestRemove}
            variant="secondary"
            isDisabled={isRemoving}
            isLoading={isRemoving}
            accessibilityLabel={`Remove download for ${manifest.title}`}
            testID={`library-offline-remove-${manifest.bookId}`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  action: {
    flex: 1,
  },
});
