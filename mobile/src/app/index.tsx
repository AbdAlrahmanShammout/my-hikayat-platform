import { Redirect } from 'expo-router';
import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

/**
 * Entry redirect after session bootstrap is stable.
 */
export default function IndexRoute(): JSX.Element {
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
  return <Redirect href="/(public)/sign-in" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
