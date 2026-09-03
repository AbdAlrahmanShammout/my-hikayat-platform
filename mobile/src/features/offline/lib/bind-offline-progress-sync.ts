import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import { flushOfflineProgressOpsBestEffort } from '@/features/offline/lib/flush-offline-progress-ops';
import { subscribeConnectivity } from '@/native/connectivity/net-info-adapter';

/**
 * Flushes pending offline reading progress on reconnect and app foreground.
 */
export function bindOfflineProgressSync(): () => void {
  const unsubscribeConnectivity = subscribeConnectivity((snapshot) => {
    if (!snapshot.isOnline) {
      return;
    }
    void flushOfflineProgressOpsBestEffort();
  });
  const onAppStateChange = (status: AppStateStatus): void => {
    if (status !== 'active') {
      return;
    }
    void flushOfflineProgressOpsBestEffort();
  };
  const subscription: NativeEventSubscription = AppState.addEventListener(
    'change',
    onAppStateChange,
  );
  void flushOfflineProgressOpsBestEffort();
  return () => {
    unsubscribeConnectivity();
    subscription.remove();
  };
}
