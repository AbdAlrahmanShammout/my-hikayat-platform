import {
  deleteSecureItem,
  readSecureItem,
  SECURE_STORAGE_KEYS,
  writeSecureItem,
} from '@/storage/secure-storage';

type AccessTokenListener = () => void;

const listeners: Set<AccessTokenListener> = new Set();
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

/**
 * Returns the in-memory Bearer access token after hydrateSessionStore.
 */
export function readAccessToken(): string | null {
  return memoryAccessToken;
}

/**
 * Returns the in-memory refresh token after hydrateSessionStore.
 */
export function readRefreshToken(): string | null {
  return memoryRefreshToken;
}

/**
 * Loads persisted tokens into memory. Call once at app start.
 */
export async function hydrateSessionStore(): Promise<string | null> {
  memoryAccessToken = await readSecureItem(SECURE_STORAGE_KEYS.accessToken);
  memoryRefreshToken = await readSecureItem(SECURE_STORAGE_KEYS.refreshToken);
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
 * Persists the refresh token for renewing the access session.
 */
export async function writeRefreshToken(refreshToken: string): Promise<void> {
  memoryRefreshToken = refreshToken;
  await writeSecureItem(SECURE_STORAGE_KEYS.refreshToken, refreshToken);
}

/**
 * Clears access and refresh tokens. Call after failed refresh or sign-out.
 */
export async function clearSessionTokens(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  await deleteSecureItem(SECURE_STORAGE_KEYS.accessToken);
  await deleteSecureItem(SECURE_STORAGE_KEYS.refreshToken);
  notifyAccessTokenListeners();
}

/**
 * @deprecated Prefer clearSessionTokens — clears access and refresh.
 */
export async function clearAccessToken(): Promise<void> {
  await clearSessionTokens();
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
