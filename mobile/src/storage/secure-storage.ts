import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Centralized SecureStore / web localStorage key names for small secrets.
 */
export const SECURE_STORAGE_KEYS = {
  accessToken: 'session.access-token',
  refreshToken: 'session.refresh-token',
} as const;

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];

/**
 * Reads a small secret from SecureStore (native) or localStorage (web).
 */
export async function readSecureItem(key: SecureStorageKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    const value: string | null = globalThis.localStorage?.getItem(key) ?? null;
    if (value === null || value.trim() === '') {
      return null;
    }
    return value;
  }
  return SecureStore.getItemAsync(key);
}

/**
 * Writes a small secret to SecureStore (native) or localStorage (web).
 */
export async function writeSecureItem(key: SecureStorageKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

/**
 * Removes a small secret from SecureStore (native) or localStorage (web).
 */
export async function deleteSecureItem(key: SecureStorageKey): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
