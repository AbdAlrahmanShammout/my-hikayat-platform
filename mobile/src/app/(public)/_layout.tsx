import { Redirect, Stack } from 'expo-router';
import type { JSX } from 'react';

import { SessionSplash } from '@/session/session-splash';
import { useSession } from '@/session/use-session';

/**
 * Public auth route group. Redirects signed-in users into the app shell.
 */
export default function PublicLayout(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading' || status === 'restoreFailed') {
    return <SessionSplash />;
  }
  if (status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
