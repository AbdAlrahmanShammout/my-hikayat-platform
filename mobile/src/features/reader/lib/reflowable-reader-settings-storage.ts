import { readLocalValue, writeLocalValue } from '@/storage/local-storage';
import {
  DEFAULT_REFLOWABLE_READER_SETTINGS,
  type ReflowableReaderSettings,
  type ReflowableReaderTheme,
} from '@/features/reader/lib/reflowable-reader-settings';

const REFLOWABLE_READER_SETTINGS_KEY = 'reader.reflowable.settings.v1';

/**
 * Loads persisted reflowable reading preferences for this device.
 * Local-only — not synced across devices in this release.
 */
export async function loadReflowableReaderSettings(): Promise<ReflowableReaderSettings> {
  const raw: string | null = await readLocalValue(REFLOWABLE_READER_SETTINGS_KEY);
  if (raw === null) {
    return DEFAULT_REFLOWABLE_READER_SETTINGS;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return normalizeReflowableReaderSettings(parsed);
  } catch {
    return DEFAULT_REFLOWABLE_READER_SETTINGS;
  }
}

/**
 * Persists reflowable reading preferences on this device.
 */
export async function saveReflowableReaderSettings(
  settings: ReflowableReaderSettings,
): Promise<void> {
  await writeLocalValue(REFLOWABLE_READER_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Restores factory defaults and clears the persisted preference.
 */
export async function resetReflowableReaderSettings(): Promise<ReflowableReaderSettings> {
  await writeLocalValue(
    REFLOWABLE_READER_SETTINGS_KEY,
    JSON.stringify(DEFAULT_REFLOWABLE_READER_SETTINGS),
  );
  return DEFAULT_REFLOWABLE_READER_SETTINGS;
}

function normalizeReflowableReaderSettings(value: unknown): ReflowableReaderSettings {
  if (value === null || typeof value !== 'object') {
    return DEFAULT_REFLOWABLE_READER_SETTINGS;
  }
  const record = value as Record<string, unknown>;
  return {
    fontScalePercent: coerceBoundedNumber(
      record.fontScalePercent,
      DEFAULT_REFLOWABLE_READER_SETTINGS.fontScalePercent,
      90,
      160,
    ),
    lineHeight: coerceBoundedNumber(
      record.lineHeight,
      DEFAULT_REFLOWABLE_READER_SETTINGS.lineHeight,
      1.2,
      2,
    ),
    marginPx: coerceBoundedNumber(
      record.marginPx,
      DEFAULT_REFLOWABLE_READER_SETTINGS.marginPx,
      8,
      36,
    ),
    theme: coerceTheme(record.theme),
  };
}

function coerceBoundedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function coerceTheme(value: unknown): ReflowableReaderTheme {
  if (value === 'dark' || value === 'light') {
    return value;
  }
  return DEFAULT_REFLOWABLE_READER_SETTINGS.theme;
}
