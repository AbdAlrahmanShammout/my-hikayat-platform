import { router, type Href } from 'expo-router';
import { useCallback, useState, type JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceClockTamperPanel } from '@/features/offline/components/device-clock-tamper-panel';
import { useIsClockRollbackDetected } from '@/features/offline/hooks/use-is-clock-rollback-detected';
import { theme } from '@/theme/theme';
import { BackHeader } from '@/ui/primitives/back-header';

/**
 * Dedicated Figma clock-tamper route. CTA retries trusted time, not Subscribe.
 */
export function DeviceClockTamperScreen(): JSX.Element {
  const clockRollback = useIsClockRollbackDetected();
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const executeReconnect = useCallback(async (): Promise<void> => {
    if (isReconnecting) {
      return;
    }
    setIsReconnecting(true);
    const isStillDetected: boolean = await clockRollback.refetch();
    setIsReconnecting(false);
    if (!isStillDetected) {
      navigateBackToLibrary();
    }
  }, [clockRollback.refetch, isReconnecting]);
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="device-clock-tamper-screen"
    >
      <BackHeader
        title=""
        backTestID="device-clock-tamper-back"
        onPressBack={navigateBackToLibrary}
      />
      <View style={styles.body}>
        <DeviceClockTamperPanel
          isReconnecting={isReconnecting}
          onReconnect={() => {
            void executeReconnect();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function navigateBackToLibrary(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/(tabs)/library' as Href);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
});
