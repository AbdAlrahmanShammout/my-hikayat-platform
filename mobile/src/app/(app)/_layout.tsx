import { Redirect, Stack } from 'expo-router';
import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Authenticated route group. UX guard only — backend remains authoritative.
 */
export default function AppLayout(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <View style={styles.loading} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if (status === 'signedOut') {
    return <Redirect href="/(public)/sign-in" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
