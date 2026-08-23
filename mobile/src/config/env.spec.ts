import { getMobilePublicConfig, readApiBaseUrlOrPlaceholder } from './env';

describe('getMobilePublicConfig', () => {
  const originalValue: string | undefined = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      return;
    }
    process.env.EXPO_PUBLIC_API_BASE_URL = originalValue;
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
});
