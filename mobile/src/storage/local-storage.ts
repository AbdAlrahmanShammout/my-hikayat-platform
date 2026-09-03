import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Reads a non-sensitive string preference.
 * Features must use this adapter instead of calling AsyncStorage directly.
 */
export async function readLocalValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return AsyncStorage.getItem(key);
}

/**
 * Writes a non-sensitive string preference.
 */
export async function writeLocalValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

/**
 * Removes a non-sensitive string preference.
 */
export async function deleteLocalValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}
