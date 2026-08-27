import { mapNetInfoToConnectivity } from '@/native/connectivity/connectivity-state';

describe('mapNetInfoToConnectivity', () => {
  it('is offline when the device is disconnected', () => {
    const actual = mapNetInfoToConnectivity({
      isConnected: false,
      isInternetReachable: null,
    });
    expect(actual.isOnline).toBe(false);
  });

  it('is offline when connected but internet is unreachable', () => {
    const actual = mapNetInfoToConnectivity({
      isConnected: true,
      isInternetReachable: false,
    });
    expect(actual.isOnline).toBe(false);
  });

  it('is online when connectivity is unknown', () => {
    const actual = mapNetInfoToConnectivity({
      isConnected: null,
      isInternetReachable: null,
    });
    expect(actual.isOnline).toBe(true);
  });
});
