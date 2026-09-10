import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { Button } from '@/ui/primitives/button';

type RemoveOfflineDownloadSheetProps = {
  readonly bookTitle: string | null;
  readonly isRemoving: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

/**
 * Confirms removing one downloaded package. The parent still owns the remove call.
 */
export function RemoveOfflineDownloadSheet({
  bookTitle,
  isRemoving,
  onConfirm,
  onCancel,
}: RemoveOfflineDownloadSheetProps): JSX.Element {
  const isVisible: boolean = bookTitle !== null;
  return (
    <BottomSheet
      isVisible={isVisible}
      onDismiss={onCancel}
      accessibilityLabel="Remove download?"
    >
      {bookTitle !== null ? (
        <View style={styles.body}>
          <View style={styles.icon} accessibilityElementsHidden>
            <Text style={styles.iconMark}>!</Text>
          </View>
          <Text style={styles.title}>Remove download?</Text>
          <Text style={styles.message}>
            {`“${bookTitle}” will be removed from this device. You can download it again any time you are online.`}
          </Text>
          <Button
            label="Remove download"
            onPress={onConfirm}
            variant="destructive"
            isLoading={isRemoving}
            isDisabled={isRemoving}
          />
          <Button
            label="Keep it"
            onPress={onCancel}
            variant="secondary"
            isDisabled={isRemoving}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMark: {
    ...theme.typography.title,
    color: theme.colors.warning,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});
