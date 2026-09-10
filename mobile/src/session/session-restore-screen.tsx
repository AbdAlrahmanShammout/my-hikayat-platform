import { useState, type JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  buildOfflinePurgeConfirmCopy,
  shouldRequireOfflinePurgeConfirmation,
  type OfflinePurgeConfirmCopy,
} from '@/features/offline/lib/confirm-offline-purge-if-needed';
import { listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { Button } from '@/ui/primitives/button';

/**
 * Shown when a stored token exists but /auth/me could not be restored (non-401).
 */
export function SessionRestoreScreen(): JSX.Element {
  const { errorMessage, retryRestore, abandonRestore, clearError } = useSession();
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isAbandoning, setIsAbandoning] = useState<boolean>(false);
  const [purgeCopy, setPurgeCopy] = useState<OfflinePurgeConfirmCopy | null>(null);

  async function handleRetry(): Promise<void> {
    clearError();
    setIsRetrying(true);
    try {
      await retryRestore();
    } finally {
      setIsRetrying(false);
    }
  }

  async function executeAbandonRestore(): Promise<void> {
    setIsAbandoning(true);
    try {
      await abandonRestore();
    } finally {
      setIsAbandoning(false);
      setPurgeCopy(null);
    }
  }

  async function handleSignInInsteadPress(): Promise<void> {
    const packages = await listOfflineManifests();
    if (!shouldRequireOfflinePurgeConfirmation(packages.length)) {
      await executeAbandonRestore();
      return;
    }
    setPurgeCopy(
      buildOfflinePurgeConfirmCopy({
        kind: 'abandon_restore',
        packageCount: packages.length,
      }),
    );
  }

  const isBusy: boolean = isRetrying || isAbandoning;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.container}>
        <View style={styles.iconWell} accessibilityElementsHidden>
          <Text style={styles.iconMark}>!</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Could not restore your session
        </Text>
        <Text style={styles.body}>
          {errorMessage ?? 'Check your connection, then try again.'}
        </Text>
        <Button
          label="Try again"
          onPress={() => {
            void handleRetry();
          }}
          isLoading={isRetrying}
          isDisabled={isBusy}
          accessibilityLabel="Try again"
        />
        <Button
          label="Sign in instead"
          onPress={() => {
            void handleSignInInsteadPress();
          }}
          variant="secondary"
          isDisabled={isBusy}
          accessibilityLabel="Sign in instead"
          testID="session-restore-abandon-button"
        />
      </View>
      <BottomSheet
        isVisible={purgeCopy !== null}
        onDismiss={() => {
          if (!isAbandoning) {
            setPurgeCopy(null);
          }
        }}
        accessibilityLabel={purgeCopy?.title}
      >
        {purgeCopy !== null ? (
          <View style={styles.sheetBody}>
            <View style={styles.sheetIcon} accessibilityElementsHidden>
              <Text style={styles.iconMark}>!</Text>
            </View>
            <Text style={styles.sheetTitle}>{purgeCopy.title}</Text>
            <Text style={styles.sheetMessage}>{purgeCopy.message}</Text>
            <Button
              label={purgeCopy.confirmLabel}
              onPress={() => {
                void executeAbandonRestore();
              }}
              variant="destructive"
              isLoading={isAbandoning}
            />
            <Button
              label={purgeCopy.cancelLabel}
              onPress={() => {
                setPurgeCopy(null);
              }}
              variant="secondary"
              isDisabled={isAbandoning}
            />
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
    alignItems: 'stretch',
  },
  iconWell: {
    alignSelf: 'center',
    width: theme.spacing.xxxl + theme.spacing.lg,
    height: theme.spacing.xxxl + theme.spacing.lg,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  iconMark: {
    ...theme.typography.title,
    color: theme.colors.warning,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale['2xl'],
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  sheetBody: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  sheetMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});
