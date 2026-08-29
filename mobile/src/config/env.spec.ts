import {
  getOfflineLeasePublicKey,
  getMobilePublicConfig,
  readApiBaseUrlOrPlaceholder,
} from './env';

describe('getMobilePublicConfig', () => {
  const originalValue: string | undefined = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalLeasePublicKey: string | undefined =
    process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalValue;
    }
    if (originalLeasePublicKey === undefined) {
      delete process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY;
      return;
    }
    process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY = originalLeasePublicKey;
  });

  it('returns a trimmed API base URL without a trailing slash', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = ' https://api.example.com/ ';
    expect(getMobilePublicConfig()).toEqual({ apiBaseUrl: 'https://api.example.com' });
  });

  it('throws when the API base URL is missing', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(() => getMobilePublicConfig()).toThrow(/EXPO_PUBLIC_API_BASE_URL/);
  });

  it('returns a placeholder when the env var is missing', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(readApiBaseUrlOrPlaceholder()).toBe('(set EXPO_PUBLIC_API_BASE_URL)');
  });

  it('throws when the offline lease public key is missing', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    delete process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY;
    expect(() => getOfflineLeasePublicKey()).toThrow(/EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY/);
  });

  it('returns the offline lease public key', () => {
    process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY = 'public-key';
    expect(getOfflineLeasePublicKey()).toBe('public-key');
  });
});
