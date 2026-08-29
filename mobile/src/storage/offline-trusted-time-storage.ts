import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LAST_TRUSTED_SERVER_TIME_KEY = 'offline.trusted-time.server';
const LAST_DEVICE_TIME_KEY = 'offline.trusted-time.device';
const CLOCK_ROLLBACK_TOLERANCE_MS = 5 * 60 * 1000;

export type TrustedNowResult = {
  readonly nowMs: number;
  readonly isClockRollbackDetected: boolean;
};

export async function recordTrustedServerTime(value: string | Date): Promise<void> {
  const timeMs: number = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(timeMs)) {
    return;
  }
  const previousMs: number | null = await readStoredTime(LAST_TRUSTED_SERVER_TIME_KEY);
  const nextMs: number = previousMs === null ? timeMs : Math.max(previousMs, timeMs);
  await writeStoredTime(LAST_TRUSTED_SERVER_TIME_KEY, nextMs);
}

export async function recordTrustedServerDateHeader(value: string | null): Promise<void> {
  if (value === null || value.trim().length === 0) {
    return;
  }
  await recordTrustedServerTime(value);
}

export async function resolveTrustedNow(): Promise<TrustedNowResult> {
  const deviceNowMs: number = Date.now();
  const lastDeviceTimeMs: number | null = await readStoredTime(LAST_DEVICE_TIME_KEY);
  const lastServerTimeMs: number | null = await readStoredTime(LAST_TRUSTED_SERVER_TIME_KEY);
  const isClockRollbackDetected: boolean =
    lastDeviceTimeMs !== null && deviceNowMs + CLOCK_ROLLBACK_TOLERANCE_MS < lastDeviceTimeMs;
  await writeStoredTime(
    LAST_DEVICE_TIME_KEY,
    lastDeviceTimeMs === null ? deviceNowMs : Math.max(lastDeviceTimeMs, deviceNowMs),
  );
  return {
    nowMs: Math.max(deviceNowMs, lastServerTimeMs ?? 0),
    isClockRollbackDetected,
  };
}

async function readStoredTime(key: string): Promise<number | null> {
  const raw: string | null = await readStoredValue(key);
  if (raw === null) {
    return null;
  }
  const parsed: number = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

async function writeStoredTime(key: string, value: number): Promise<void> {
  await writeStoredValue(key, String(Math.floor(value)));
}

async function readStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
