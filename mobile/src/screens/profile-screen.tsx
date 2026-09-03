import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscriptionExpiryBanner } from '@/features/billing/components/subscription-expiry-banner';
import { SubscriptionStatusCard } from '@/features/billing/components/subscription-status-card';
import { confirmOfflinePurgeIfNeeded } from '@/features/offline/lib/confirm-offline-purge-if-needed';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Profile tab: identity from /auth/me, expiry awareness, subscription status, settings, sign-out.
 */
export function ProfileScreen(): JSX.Element {
  const { user, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  async function executeSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleSignOutPress(): Promise<void> {
    await confirmOfflinePurgeIfNeeded({
      kind: 'sign_out',
      onConfirm: executeSignOut,
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-profile-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="shell-profile-title">
          Me
        </Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value} testID="shell-profile-email">
          {user?.email ?? '—'}
        </Text>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value} testID="shell-profile-role">
          {user?.role ?? '—'}
        </Text>
        <SubscriptionExpiryBanner placement="me" />
        <SubscriptionStatusCard />
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            router.push('/(app)/settings' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          testID="shell-settings-button"
        >
          <Text style={styles.secondaryLabel}>Settings</Text>
        </Pressable>
        <Pressable
          style={[styles.button, isSigningOut ? styles.buttonDisabled : null]}
          onPress={() => {
            void handleSignOutPress();
          }}
          disabled={isSigningOut}
          testID="shell-sign-out-button"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          {isSigningOut ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.buttonLabel}>Sign out</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  value: {
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  secondaryButton: {
    marginTop: theme.spacing.lg,
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  button: {
    marginTop: theme.spacing.sm,
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
