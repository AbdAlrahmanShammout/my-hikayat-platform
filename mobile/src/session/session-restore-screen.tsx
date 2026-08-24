import { useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Shown when a stored token exists but /auth/me could not be restored (non-401).
 */
export function SessionRestoreScreen(): JSX.Element {
  const { errorMessage, retryRestore, abandonRestore, clearError } = useSession();
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isAbandoning, setIsAbandoning] = useState<boolean>(false);

  async function handleRetry(): Promise<void> {
    clearError();
    setIsRetrying(true);
    try {
      await retryRestore();
    } finally {
      setIsRetrying(false);
    }
  }

  async function handleSignInInstead(): Promise<void> {
    setIsAbandoning(true);
    try {
      await abandonRestore();
    } finally {
      setIsAbandoning(false);
    }
  }

  const isBusy: boolean = isRetrying || isAbandoning;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Could not restore your session
        </Text>
        <Text style={styles.body}>
          {errorMessage ?? 'Check your connection, then try again.'}
        </Text>
        <Pressable
          style={[styles.primaryButton, isBusy ? styles.buttonDisabled : null]}
          onPress={() => {
            void handleRetry();
          }}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          {isRetrying ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.primaryLabel}>Try again</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void handleSignInInstead();
          }}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Sign in instead"
        >
          <Text style={styles.secondaryLabel}>Sign in instead</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
});
