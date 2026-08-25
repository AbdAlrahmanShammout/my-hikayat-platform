import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Builds the SecureStore key for a cached offline content DEK.
 */
export function buildOfflineDekStorageKey(bookId: number, bookAssetId: number): string {
  return `offline.dek.${bookId}.${bookAssetId}`;
}

/**
 * Reads a base64 DEK cached for offline reading.
 */
export async function readOfflineDek(
  bookId: number,
  bookAssetId: number,
): Promise<string | null> {
  const key: string = buildOfflineDekStorageKey(bookId, bookAssetId);
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
 * Stores a base64 DEK for offline reading. Never store plaintext EPUB bytes here.
 */
export async function writeOfflineDek(
  bookId: number,
  bookAssetId: number,
  keyBase64: string,
): Promise<void> {
  const key: string = buildOfflineDekStorageKey(bookId, bookAssetId);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, keyBase64);
    return;
  }
  await SecureStore.setItemAsync(key, keyBase64);
}

/**
 * Removes a cached offline DEK.
 */
export async function deleteOfflineDek(bookId: number, bookAssetId: number): Promise<void> {
  const key: string = buildOfflineDekStorageKey(bookId, bookAssetId);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
