import NetInfo from '@react-native-community/netinfo';

import {
  mapNetInfoToConnectivity,
  type ConnectivitySnapshot,
} from '@/native/connectivity/connectivity-state';

/**
 * Reads current connectivity from NetInfo. NetInfo is the only source of truth.
 */
export async function fetchConnectivitySnapshot(): Promise<ConnectivitySnapshot> {
  const state = await NetInfo.fetch();
  return mapNetInfoToConnectivity(state);
}

/**
 * Subscribes to NetInfo connectivity changes. Returns an unsubscribe function.
 */
export function subscribeConnectivity(
  listener: (snapshot: ConnectivitySnapshot) => void,
): () => void {
  return NetInfo.addEventListener((state) => {
    listener(mapNetInfoToConnectivity(state));
  });
}
