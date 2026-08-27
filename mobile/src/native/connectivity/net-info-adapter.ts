import { Platform } from 'react-native';

import {
  mapNetInfoToConnectivity,
  type ConnectivitySnapshot,
} from '@/native/connectivity/connectivity-state';

type NetInfoLikeState = {
  readonly isConnected: boolean | null;
  readonly isInternetReachable?: boolean | null;
};

type NetInfoLikeModule = {
  fetch: () => Promise<NetInfoLikeState>;
  addEventListener: (listener: (state: NetInfoLikeState) => void) => () => void;
};

let cachedNetInfo: NetInfoLikeModule | null | undefined;

/**
 * Loads NetInfo at runtime so unit tests do not require the native module.
 */
function loadNetInfoModule(): NetInfoLikeModule | null {
  if (cachedNetInfo !== undefined) {
    return cachedNetInfo;
  }
  try {
    // Runtime optional native module; unit tests do not install NetInfo.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedNetInfo = require('@react-native-community/netinfo') as NetInfoLikeModule;
    return cachedNetInfo;
  } catch {
    cachedNetInfo = null;
    return null;
  }
}

function fallbackSnapshot(): ConnectivitySnapshot {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return { isOnline: navigator.onLine !== false };
  }
  return { isOnline: true };
}

/**
 * Reads current connectivity. Falls back to online when NetInfo is unavailable.
 */
export async function fetchConnectivitySnapshot(): Promise<ConnectivitySnapshot> {
  const netInfo = loadNetInfoModule();
  if (netInfo === null) {
    return fallbackSnapshot();
  }
  const state: NetInfoLikeState = await netInfo.fetch();
  return mapNetInfoToConnectivity(state);
}

/**
 * Subscribes to connectivity changes. Returns an unsubscribe function.
 */
export function subscribeConnectivity(
  listener: (snapshot: ConnectivitySnapshot) => void,
): () => void {
  const netInfo = loadNetInfoModule();
  if (netInfo === null) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onOnline = (): void => {
        listener({ isOnline: true });
      };
      const onOffline = (): void => {
        listener({ isOnline: false });
      };
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
      return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      };
    }
    return () => undefined;
  }
  return netInfo.addEventListener((state: NetInfoLikeState) => {
    listener(mapNetInfoToConnectivity(state));
  });
}
