import type { JSX, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';

type BottomSheetProps = {
  readonly isVisible: boolean;
  readonly onDismiss: () => void;
  readonly children: ReactNode;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
};

/**
 * Visual bottom-sheet shell using React Native Modal.
 * Confirmation copy and destructive actions stay in the parent.
 */
export function BottomSheet({
  isVisible,
  onDismiss,
  children,
  testID,
  accessibilityLabel,
}: BottomSheetProps): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.root} testID={testID}>
        <Pressable
          style={styles.scrim}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={[styles.panel, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.navBg,
    opacity: 0.4,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: theme.spacing.xl + theme.spacing.xs,
    height: theme.spacing.scale.xs,
    borderRadius: theme.radii.xs,
    backgroundColor: theme.colors.borderDefault,
    marginBottom: theme.spacing.sm,
  },
});
