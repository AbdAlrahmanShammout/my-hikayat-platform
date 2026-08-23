import { StatusBar } from 'expo-status-bar';
import type { JSX } from 'react';

import { BootstrapScreen } from '../features/bootstrap/components/bootstrap-screen';

/**
 * Root component for the Expo reader app.
 */
export function App(): JSX.Element {
  return (
    <>
      <BootstrapScreen />
      <StatusBar style="dark" />
    </>
  );
}
