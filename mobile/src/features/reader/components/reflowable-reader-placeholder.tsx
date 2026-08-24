import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import { theme } from '@/theme/theme';

type ReflowableReaderPlaceholderProps = {
  readonly book: CatalogBook;
  readonly session: ReadingSession;
  readonly hasDeliveryGrant: boolean;
  readonly onClose: () => void;
};

/**
 * Placeholder reflowable engine chrome. Real EPUB rendering arrives in a later STEP.
 */
export function ReflowableReaderPlaceholder({
  book,
  session,
  hasDeliveryGrant,
  onClose,
}: ReflowableReaderPlaceholderProps): JSX.Element {
  return (
    <View style={styles.container} testID="reader-reflowable-placeholder">
      <Text style={styles.engineLabel} testID="reader-engine-label">
        Reflowable reader
      </Text>
      <Text style={styles.title} accessibilityRole="header" testID="reader-book-title">
        {book.title}
      </Text>
      <Text style={styles.body}>
        Chapter reading will open here. Session {session.id} is active.
      </Text>
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
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
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
