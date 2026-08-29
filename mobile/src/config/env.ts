/**
 * Reads public runtime config from Expo env vars.
 * Never hardcode machine-local URLs or secrets here.
 */
export type MobilePublicConfig = {
  readonly apiBaseUrl: string;
};

const API_BASE_URL_ENV = 'EXPO_PUBLIC_API_BASE_URL';
const OFFLINE_LEASE_PUBLIC_KEY_ENV = 'EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY';

/**
 * Returns the configured API base URL or throws when missing/blank.
 */
export function getMobilePublicConfig(): MobilePublicConfig {
  const apiBaseUrl: string | undefined = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (apiBaseUrl === undefined || apiBaseUrl.length === 0) {
    throw new Error(
      `${API_BASE_URL_ENV} is required. Copy mobile/.env.example to mobile/.env and set the API origin.`,
    );
  }
  return { apiBaseUrl: stripTrailingSlash(apiBaseUrl) };
}

/**
 * Returns the public Ed25519 key used to verify server-issued offline leases.
 */
export function getOfflineLeasePublicKey(): string {
  const offlineLeasePublicKey: string | undefined =
    process.env.EXPO_PUBLIC_OFFLINE_LEASE_PUBLIC_KEY?.trim();
  if (offlineLeasePublicKey === undefined || offlineLeasePublicKey.length === 0) {
    throw new Error(
      `${OFFLINE_LEASE_PUBLIC_KEY_ENV} is required. Copy mobile/.env.example to mobile/.env and set the offline lease public key.`,
    );
  }
  return offlineLeasePublicKey;
}

/**
 * Safe display helper for the bootstrap screen when env is incomplete.
 */
export function readApiBaseUrlOrPlaceholder(): string {
  try {
    return getMobilePublicConfig().apiBaseUrl;
  } catch {
    return `(set ${API_BASE_URL_ENV})`;
  }
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
