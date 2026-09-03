const ACCESS_TOKEN_STORAGE_KEY = 'noory.accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'noory.refreshToken';

type AccessTokenListener = () => void;

const listeners: Set<AccessTokenListener> = new Set();

/**
 * Reads the Bearer access token from session storage.
 */
export function readAccessToken(): string | null {
  return readStorageValue(ACCESS_TOKEN_STORAGE_KEY);
}

/**
 * Reads the refresh token from session storage.
 */
export function readRefreshToken(): string | null {
  return readStorageValue(REFRESH_TOKEN_STORAGE_KEY);
}

/**
 * Persists the Bearer access token for the current browser tab.
 */
export function writeAccessToken(accessToken: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  notifyAccessTokenListeners();
}

/**
 * Persists the refresh token for the current browser tab.
 */
export function writeRefreshToken(refreshToken: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

/**
 * Clears access and refresh tokens. Call after failed refresh or sign-out.
 */
export function clearSessionTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  notifyAccessTokenListeners();
}

/**
 * @deprecated Prefer clearSessionTokens.
 */
export function clearAccessToken(): void {
  clearSessionTokens();
}

/**
 * Subscribes to token writes and clears. Returns an unsubscribe function.
 */
export function subscribeAccessToken(listener: AccessTokenListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStorageValue(key: string): string | null {
  const value: string | null = sessionStorage.getItem(key);
  if (value === null || value.trim() === '') {
    return null;
  }
  return value;
}

function notifyAccessTokenListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}
