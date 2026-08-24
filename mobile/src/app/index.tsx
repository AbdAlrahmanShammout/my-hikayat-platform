import { Redirect } from 'expo-router';
import type { JSX } from 'react';
import { View } from 'react-native';

import { SessionRestoreScreen } from '@/session/session-restore-screen';
import { useSession } from '@/session/use-session';

/**
 * Entry redirect after session bootstrap is stable.
 */
export default function IndexRoute(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading') {
    return <View style={{ flex: 1 }} accessibilityLabel="Loading" />;
  }
  if (status === 'restoreFailed') {
    return <SessionRestoreScreen />;
  }
  if (status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return <Redirect href="/(public)/sign-in" />;
}
