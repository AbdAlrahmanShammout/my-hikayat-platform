import { Redirect, Stack } from 'expo-router';
import type { JSX } from 'react';
import { View } from 'react-native';

import { useSession } from '@/session/use-session';

/**
 * Authenticated route group. UX guard only — backend remains authoritative.
 */
export default function AppLayout(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading' || status === 'restoreFailed') {
    return <View style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }
  if (status === 'signedOut') {
    return <Redirect href="/(public)/sign-in" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
