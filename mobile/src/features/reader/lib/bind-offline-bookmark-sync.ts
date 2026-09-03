import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import { flushOfflineBookmarkOpsBestEffort } from '@/features/reader/lib/flush-offline-bookmark-ops';
import { subscribeConnectivity } from '@/native/connectivity/net-info-adapter';

/**
 * Flushes pending offline bookmark ops on reconnect and app foreground.
 */
export function bindOfflineBookmarkSync(): () => void {
  const unsubscribeConnectivity = subscribeConnectivity((snapshot) => {
    if (!snapshot.isOnline) {
      return;
    }
    void flushOfflineBookmarkOpsBestEffort();
  });
  const onAppStateChange = (status: AppStateStatus): void => {
    if (status !== 'active') {
      return;
    }
    void flushOfflineBookmarkOpsBestEffort();
  };
  const subscription: NativeEventSubscription = AppState.addEventListener(
    'change',
    onAppStateChange,
  );
  void flushOfflineBookmarkOpsBestEffort();
  return () => {
    unsubscribeConnectivity();
    subscription.remove();
  };
}
