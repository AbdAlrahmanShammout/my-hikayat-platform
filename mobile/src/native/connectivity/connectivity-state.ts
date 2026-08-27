export type ConnectivitySnapshot = {
  readonly isOnline: boolean;
};

/**
 * Maps a NetInfo-like payload to the app connectivity snapshot.
 * Unknown / null `isConnected` is treated as online so we never show offline from missing data.
 */
export function mapNetInfoToConnectivity(state: {
  readonly isConnected: boolean | null;
  readonly isInternetReachable?: boolean | null;
}): ConnectivitySnapshot {
  if (state.isConnected === false) {
    return { isOnline: false };
  }
  if (state.isInternetReachable === false) {
    return { isOnline: false };
  }
  return { isOnline: true };
}
