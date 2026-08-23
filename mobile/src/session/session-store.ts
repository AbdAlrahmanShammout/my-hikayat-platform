import {
  deleteSecureItem,
  readSecureItem,
  SECURE_STORAGE_KEYS,
  writeSecureItem,
} from '@/storage/secure-storage';

type AccessTokenListener = () => void;

const listeners: Set<AccessTokenListener> = new Set();
let memoryAccessToken: string | null = null;

/**
 * Returns the in-memory Bearer access token after hydrateSessionStore.
 */
export function readAccessToken(): string | null {
  return memoryAccessToken;
}

/**
 * Loads the persisted token into memory. Call once at app start.
 */
export async function hydrateSessionStore(): Promise<string | null> {
  memoryAccessToken = await readSecureItem(SECURE_STORAGE_KEYS.accessToken);
  notifyAccessTokenListeners();
  return memoryAccessToken;
}

/**
 * Persists the Bearer access token for the device (SecureStore) or web tab.
 */
export async function writeAccessToken(accessToken: string): Promise<void> {
  memoryAccessToken = accessToken;
  await writeSecureItem(SECURE_STORAGE_KEYS.accessToken, accessToken);
  notifyAccessTokenListeners();
}

/**
 * Clears the stored access token. A 401 from the API must call this.
 */
export async function clearAccessToken(): Promise<void> {
  memoryAccessToken = null;
  await deleteSecureItem(SECURE_STORAGE_KEYS.accessToken);
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
