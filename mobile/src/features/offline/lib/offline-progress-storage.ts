import { offlineFileSystem as FileSystem } from '@/native/offline-file-system';

import type { OfflineReadingProgressRecord } from '@/features/offline/types/offline-reading-progress-record';
import {
  ensureOfflineStorageDirectories,
  OFFLINE_PROGRESS_FILE_PATH,
} from '@/storage/offline-file-storage';

const PROGRESS_SCHEMA_VERSION = 1 as const;

type OfflineProgressDocument = {
  readonly schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  readonly records: readonly OfflineReadingProgressRecord[];
};

/**
 * Returns local offline reading progress for one user and book, if present.
 */
export async function getOfflineReadingProgress(
  userId: number,
  bookId: number,
): Promise<OfflineReadingProgressRecord | null> {
  const document: OfflineProgressDocument = await readProgressDocument();
  return (
    document.records.find((entry) => entry.userId === userId && entry.bookId === bookId) ?? null
  );
}

/**
 * Inserts or replaces local offline reading progress for one user and book.
 */
export async function upsertOfflineReadingProgress(
  record: OfflineReadingProgressRecord,
): Promise<void> {
  const document: OfflineProgressDocument = await readProgressDocument();
  const withoutKey: OfflineReadingProgressRecord[] = document.records.filter(
    (entry) => !(entry.userId === record.userId && entry.bookId === record.bookId),
  );
  await writeProgressDocument({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    records: [...withoutKey, record],
  });
}

/**
 * Lists local progress rows that still need a server sync for one user.
 */
export async function listPendingOfflineReadingProgress(
  userId: number,
): Promise<readonly OfflineReadingProgressRecord[]> {
  const document: OfflineProgressDocument = await readProgressDocument();
  return document.records.filter(
    (entry) => entry.userId === userId && entry.pendingSync === true,
  );
}

/**
 * Clears the pending-sync flag after a successful server upload.
 */
export async function markOfflineReadingProgressSynced(
  userId: number,
  bookId: number,
): Promise<void> {
  const existing: OfflineReadingProgressRecord | null = await getOfflineReadingProgress(
    userId,
    bookId,
  );
  if (existing === null) {
    return;
  }
  await upsertOfflineReadingProgress({
    ...existing,
    pendingSync: false,
  });
}

/**
 * Clears all local offline reading progress. Used on sign-out purge.
 */
export async function clearOfflineProgressDocument(): Promise<void> {
  await writeProgressDocument({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    records: [],
  });
}

async function readProgressDocument(): Promise<OfflineProgressDocument> {
  await ensureOfflineStorageDirectories();
  const info = await FileSystem.getInfoAsync(OFFLINE_PROGRESS_FILE_PATH);
  if (!info.exists) {
    return { schemaVersion: PROGRESS_SCHEMA_VERSION, records: [] };
  }
  const raw: string = await FileSystem.readAsStringAsync(OFFLINE_PROGRESS_FILE_PATH);
  if (raw.trim().length === 0) {
    return { schemaVersion: PROGRESS_SCHEMA_VERSION, records: [] };
  }
  try {
    const parsed: unknown = JSON.parse(raw) as unknown;
    return normalizeProgressDocument(parsed);
  } catch {
    return { schemaVersion: PROGRESS_SCHEMA_VERSION, records: [] };
  }
}

async function writeProgressDocument(document: OfflineProgressDocument): Promise<void> {
  await ensureOfflineStorageDirectories();
  await FileSystem.writeAsStringAsync(OFFLINE_PROGRESS_FILE_PATH, JSON.stringify(document));
}

function normalizeProgressDocument(value: unknown): OfflineProgressDocument {
  if (typeof value !== 'object' || value === null) {
    return { schemaVersion: PROGRESS_SCHEMA_VERSION, records: [] };
  }
  const record = value as Record<string, unknown>;
  const recordsRaw: unknown = record.records;
  if (!Array.isArray(recordsRaw)) {
    return { schemaVersion: PROGRESS_SCHEMA_VERSION, records: [] };
  }
  const records: OfflineReadingProgressRecord[] = recordsRaw
    .map((entry) => normalizeProgressRecord(entry))
    .filter((entry): entry is OfflineReadingProgressRecord => entry !== null);
  return { schemaVersion: PROGRESS_SCHEMA_VERSION, records };
}

function normalizeProgressRecord(value: unknown): OfflineReadingProgressRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const userId: number | null = coercePositiveInt(record.userId);
  const bookId: number | null = coercePositiveInt(record.bookId);
  const layoutType: OfflineReadingProgressRecord['layoutType'] | null = coerceLayoutType(
    record.layoutType,
  );
  const updatedAt: string = coerceString(record.updatedAt);
  if (userId === null || bookId === null || layoutType === null || updatedAt.length === 0) {
    return null;
  }
  return {
    userId,
    bookId,
    layoutType,
    spineIndex: coerceNullableNonNegativeInt(record.spineIndex),
    scrollOffset: coerceNullableNonNegativeInt(record.scrollOffset),
    spreadIndex: coerceNullableNonNegativeInt(record.spreadIndex),
    pageNumber: coerceNullablePositiveInt(record.pageNumber),
    updatedAt,
    // Legacy MG-5 rows without the flag are treated as pending so they upload once.
    pendingSync: record.pendingSync === false ? false : true,
  };
}

function coercePositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return null;
  }
  return Math.floor(value);
}

function coerceNullableNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

function coerceNullablePositiveInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return coercePositiveInt(value);
}

function coerceString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function coerceLayoutType(value: unknown): OfflineReadingProgressRecord['layoutType'] | null {
  if (value === 'reflowable' || value === 'fixed_layout') {
    return value;
  }
  return null;
}
