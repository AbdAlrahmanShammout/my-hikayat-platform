import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type JSX, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bindQueryFocusManager } from '@/api/bind-query-focus-manager';
import { createQueryClient } from '@/api/query-client';
import { AppErrorBoundary } from '@/root/app-error-boundary';
import { SessionProvider } from '@/session/session-provider';
import { useSession } from '@/session/use-session';
import * as WebBrowser from 'expo-web-browser';

void SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

/**
 * Root layout: providers + route stack. No feature workflows here.
 */
export default function RootLayout(): JSX.Element {
  const [queryClient] = useState(() => createQueryClient());
  useEffect(() => bindQueryFocusManager(), []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <SplashVisibilityGate>
                <Stack screenOptions={{ headerShown: false }} />
                <StatusBar style="dark" />
              </SplashVisibilityGate>
            </SessionProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}

type SplashVisibilityGateProps = {
  readonly children: ReactNode;
};

/**
 * Keeps the native splash visible until the first session routing decision is stable.
 */
function SplashVisibilityGate({ children }: SplashVisibilityGateProps): JSX.Element {
  const { status } = useSession();
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    void SplashScreen.hideAsync();
  }, [status]);
  return <>{children}</>;
}
