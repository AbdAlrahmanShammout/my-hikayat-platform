const ACCESS_TOKEN_STORAGE_KEY = 'noory.accessToken';

type AccessTokenListener = () => void;

const listeners: Set<AccessTokenListener> = new Set();

/**
 * Reads the Bearer access token from session storage.
 */
export function readAccessToken(): string | null {
  const value: string | null = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (value === null || value.trim() === '') {
    return null;
  }
  return value;
}

/**
 * Persists the Bearer access token for the current browser tab.
 */
export function writeAccessToken(accessToken: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  notifyAccessTokenListeners();
}

/**
 * Clears the stored access token. A 401 from the API must call this.
 */
export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  notifyAccessTokenListeners();
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

function notifyAccessTokenListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}
