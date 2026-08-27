import { onlineManager } from '@tanstack/react-query';

import {
  fetchConnectivitySnapshot,
  subscribeConnectivity,
} from '@/native/connectivity/net-info-adapter';

/**
 * Connects native connectivity to TanStack Query onlineManager (MOBILE-ARCHITECTURE §12.2).
 */
export function bindQueryOnlineManager(): () => void {
  const unsubscribe = subscribeConnectivity((snapshot) => {
    onlineManager.setOnline(snapshot.isOnline);
  });
  void fetchConnectivitySnapshot().then((snapshot) => {
    onlineManager.setOnline(snapshot.isOnline);
  });
  return unsubscribe;
}
