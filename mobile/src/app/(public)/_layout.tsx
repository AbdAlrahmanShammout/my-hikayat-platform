import { Redirect, Stack } from 'expo-router';
import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Public auth route group. Redirects signed-in users into the app shell.
 */
export default function PublicLayout(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <View style={styles.loading} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if (status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)/home" />;
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
