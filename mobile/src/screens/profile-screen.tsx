import { useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Profile tab: identity from /auth/me and sign-out.
 */
export function ProfileScreen(): JSX.Element {
  const { user, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} testID="shell-profile-screen">
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
      <Pressable
        style={[styles.button, isSigningOut ? styles.buttonDisabled : null]}
        onPress={() => {
          void handleSignOut();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
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
  button: {
    marginTop: theme.spacing.xl,
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
