import { Redirect } from 'expo-router';
import type { JSX } from 'react';

import { SessionRestoreScreen } from '@/session/session-restore-screen';
import { SessionSplash } from '@/session/session-splash';
import { useSession } from '@/session/use-session';

/**
 * Entry redirect after session bootstrap is stable.
 */
export default function IndexRoute(): JSX.Element {
  const { status } = useSession();
  if (status === 'loading') {
    return <SessionSplash />;
  }
  if (status === 'restoreFailed') {
    return <SessionRestoreScreen />;
  }
  if (status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }
  return <Redirect href="/(public)/sign-in" />;
}
