import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import { theme } from '@/theme/theme';

type FixedLayoutReaderPlaceholderProps = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly hasDeliveryGrant: boolean;
  readonly onClose: () => void;
};

/**
 * Placeholder fixed-layout engine chrome. Real canvas rendering arrives later.
 */
export function FixedLayoutReaderPlaceholder({
  book,
  session,
  hasDeliveryGrant,
  onClose,
}: FixedLayoutReaderPlaceholderProps): JSX.Element {
  return (
    <View style={styles.container} testID="reader-fixed-layout-placeholder">
      <Text style={styles.engineLabel} testID="reader-engine-label">
        Fixed-layout reader
      </Text>
      <Text style={styles.title} accessibilityRole="header" testID="reader-book-title">
        {book.title}
      </Text>
      <View style={styles.canvasPreview} testID="reader-fixed-layout-canvas-preview">
        <Text style={styles.canvasLabel}>Page canvas will open here</Text>
      </View>
      <Text style={styles.meta} testID="reader-session-id">
        {`Session ${session.id}`}
      </Text>
      <Text style={styles.meta}>
        {hasDeliveryGrant
          ? 'Book file grant is ready for a later engine STEP.'
          : 'Book file is not ready to download yet.'}
      </Text>
      <Pressable
        style={styles.closeButton}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close reader"
        testID="reader-close-button"
      >
        <Text style={styles.closeLabel}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  engineLabel: {
    ...theme.typography.label,
    color: theme.colors.primaryMuted,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  canvasPreview: {
    minHeight: 220,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  canvasLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  meta: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  closeLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
