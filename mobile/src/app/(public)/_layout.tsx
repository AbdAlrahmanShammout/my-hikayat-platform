import { Redirect, Stack } from 'expo-router';
import type { JSX } from 'react';
import { View } from 'react-native';

import { useSession } from '@/session/use-session';

/**
 * Public auth route group. Redirects signed-in users into the app shell.
 */
export default function PublicLayout(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading' || status === 'restoreFailed') {
    return <View style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }
  if (status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
