import { useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Me
      </Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email ?? '—'}</Text>
      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{user?.role ?? '—'}</Text>
      <Pressable
        style={[styles.button, isSigningOut ? styles.buttonDisabled : null]}
        onPress={() => {
          void handleSignOut();
        }}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        {isSigningOut ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.buttonLabel}>Sign out</Text>
        )}
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
