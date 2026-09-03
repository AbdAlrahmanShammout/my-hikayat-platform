import { offlineFileSystem as FileSystem } from '@/native/offline-file-system';

import type {
  OfflineBookmarkPendingOp,
  OfflineBookmarkRecord,
} from '@/features/reader/types/offline-bookmark-record';
import {
  ensureOfflineStorageDirectories,
  OFFLINE_BOOKMARKS_FILE_PATH,
} from '@/storage/offline-file-storage';

const BOOKMARKS_SCHEMA_VERSION = 1 as const;
export const OFFLINE_BOOKMARK_MAX_ATTEMPTS = 5 as const;

type OfflineBookmarksDocument = {
  readonly schemaVersion: typeof BOOKMARKS_SCHEMA_VERSION;
  readonly bookmarks: readonly OfflineBookmarkRecord[];
  readonly pendingOps: readonly OfflineBookmarkPendingOp[];
};

/**
 * Lists local bookmarks for one user and book.
 */
export async function listOfflineBookmarksForBook(
  userId: number,
  bookId: number,
): Promise<readonly OfflineBookmarkRecord[]> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  return document.bookmarks.filter(
    (entry) => entry.userId === userId && entry.bookId === bookId,
  );
}

/**
 * Returns all pending bookmark ops for the signed-in user.
 */
export async function listOfflineBookmarkPendingOps(
  userId: number,
): Promise<readonly OfflineBookmarkPendingOp[]> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  return document.pendingOps.filter((entry) => entry.userId === userId);
}

/**
 * Inserts or replaces one local bookmark row.
 */
export async function upsertOfflineBookmark(record: OfflineBookmarkRecord): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  const without: OfflineBookmarkRecord[] = document.bookmarks.filter(
    (entry) => !(entry.userId === record.userId && entry.localId === record.localId),
  );
  await writeBookmarksDocument({
    ...document,
    bookmarks: [...without, record],
  });
}

/**
 * Removes one local bookmark row by local id.
 */
export async function removeOfflineBookmark(userId: number, localId: string): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  await writeBookmarksDocument({
    ...document,
    bookmarks: document.bookmarks.filter(
      (entry) => !(entry.userId === userId && entry.localId === localId),
    ),
  });
}

/**
 * Enqueues a pending bookmark mutation. Dedupes create ops for the same localId.
 */
export async function enqueueOfflineBookmarkOp(op: OfflineBookmarkPendingOp): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  const withoutDuplicate: OfflineBookmarkPendingOp[] = document.pendingOps.filter((entry) => {
    if (entry.userId !== op.userId) {
      return true;
    }
    if (op.type === 'create') {
      return !(entry.type === 'create' && entry.localId === op.localId);
    }
    return entry.opId !== op.opId;
  });
  await writeBookmarksDocument({
    ...document,
    pendingOps: [...withoutDuplicate, op],
  });
}

/**
 * Removes pending create ops for a local bookmark (cancel before sync).
 */
export async function cancelPendingOfflineBookmarkCreate(
  userId: number,
  localId: string,
): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  await writeBookmarksDocument({
    ...document,
    pendingOps: document.pendingOps.filter(
      (entry) =>
        !(
          entry.userId === userId &&
          entry.localId === localId &&
          entry.type === 'create'
        ),
    ),
  });
}

/**
 * Removes one pending op by opId after successful flush.
 */
export async function removeOfflineBookmarkPendingOp(opId: string): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  await writeBookmarksDocument({
    ...document,
    pendingOps: document.pendingOps.filter((entry) => entry.opId !== opId),
  });
}

/**
 * Updates attempt metadata for a pending op after a failed flush.
 */
export async function markOfflineBookmarkOpAttempt(input: {
  readonly opId: string;
  readonly attemptCount: number;
  readonly lastAttemptAt: string;
  readonly lastError: string;
}): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  await writeBookmarksDocument({
    ...document,
    pendingOps: document.pendingOps.map((entry) => {
      if (entry.opId !== input.opId) {
        return entry;
      }
      return {
        ...entry,
        attemptCount: input.attemptCount,
        lastAttemptAt: input.lastAttemptAt,
        lastError: input.lastError,
      };
    }),
  });
}

/**
 * Clears all local bookmarks and pending ops. Used on sign-out.
 */
export async function clearOfflineBookmarksDocument(): Promise<void> {
  await writeBookmarksDocument({
    schemaVersion: BOOKMARKS_SCHEMA_VERSION,
    bookmarks: [],
    pendingOps: [],
  });
}

/**
 * Replaces synced server bookmarks for a book while keeping unsynced local-only rows.
 */
export async function reconcileOfflineBookmarksWithServer(input: {
  readonly userId: number;
  readonly bookId: number;
  readonly serverBookmarks: readonly OfflineBookmarkRecord[];
}): Promise<void> {
  const document: OfflineBookmarksDocument = await readBookmarksDocument();
  const retainedLocalOnly: OfflineBookmarkRecord[] = document.bookmarks.filter(
    (entry) =>
      entry.userId === input.userId &&
      entry.bookId === input.bookId &&
      entry.serverId === null,
  );
  const otherBooks: OfflineBookmarkRecord[] = document.bookmarks.filter(
    (entry) => !(entry.userId === input.userId && entry.bookId === input.bookId),
  );
  await writeBookmarksDocument({
    ...document,
    bookmarks: [...otherBooks, ...input.serverBookmarks, ...retainedLocalOnly],
  });
}

async function readBookmarksDocument(): Promise<OfflineBookmarksDocument> {
  await ensureOfflineStorageDirectories();
  const info = await FileSystem.getInfoAsync(OFFLINE_BOOKMARKS_FILE_PATH);
  if (!info.exists) {
    return emptyDocument();
  }
  const raw: string = await FileSystem.readAsStringAsync(OFFLINE_BOOKMARKS_FILE_PATH);
  if (raw.trim().length === 0) {
    return emptyDocument();
  }
  try {
    return normalizeBookmarksDocument(JSON.parse(raw) as unknown);
  } catch {
    return emptyDocument();
  }
}

async function writeBookmarksDocument(document: OfflineBookmarksDocument): Promise<void> {
  await ensureOfflineStorageDirectories();
  await FileSystem.writeAsStringAsync(OFFLINE_BOOKMARKS_FILE_PATH, JSON.stringify(document));
}

function emptyDocument(): OfflineBookmarksDocument {
  return {
    schemaVersion: BOOKMARKS_SCHEMA_VERSION,
    bookmarks: [],
    pendingOps: [],
  };
}

function normalizeBookmarksDocument(value: unknown): OfflineBookmarksDocument {
  if (typeof value !== 'object' || value === null) {
    return emptyDocument();
  }
  const record = value as Record<string, unknown>;
  const bookmarksRaw: unknown = record.bookmarks;
  const pendingRaw: unknown = record.pendingOps;
  const bookmarks: OfflineBookmarkRecord[] = Array.isArray(bookmarksRaw)
    ? bookmarksRaw
        .map((entry) => normalizeBookmarkRecord(entry))
        .filter((entry): entry is OfflineBookmarkRecord => entry !== null)
    : [];
  const pendingOps: OfflineBookmarkPendingOp[] = Array.isArray(pendingRaw)
    ? pendingRaw
        .map((entry) => normalizePendingOp(entry))
        .filter((entry): entry is OfflineBookmarkPendingOp => entry !== null)
    : [];
  return {
    schemaVersion: BOOKMARKS_SCHEMA_VERSION,
    bookmarks,
    pendingOps,
  };
}

function normalizeBookmarkRecord(value: unknown): OfflineBookmarkRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const localId: string = coerceString(record.localId);
  const userId: number | null = coercePositiveInt(record.userId);
  const bookId: number | null = coercePositiveInt(record.bookId);
  const layoutType = coerceLayoutType(record.layoutType);
  const createdAt: string = coerceString(record.createdAt);
  const updatedAt: string = coerceString(record.updatedAt);
  if (
    localId.length === 0 ||
    userId === null ||
    bookId === null ||
    layoutType === null ||
    createdAt.length === 0 ||
    updatedAt.length === 0
  ) {
    return null;
  }
  return {
    localId,
    userId,
    bookId,
    serverId: coerceNullablePositiveInt(record.serverId),
    layoutType,
    spineIndex: coerceNullableNonNegativeInt(record.spineIndex),
    scrollOffset: coerceNullableNonNegativeInt(record.scrollOffset),
    spreadIndex: coerceNullableNonNegativeInt(record.spreadIndex),
    pageNumber: coerceNullablePositiveInt(record.pageNumber),
    createdAt,
    updatedAt,
  };
}

function normalizePendingOp(value: unknown): OfflineBookmarkPendingOp | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const opId: string = coerceString(record.opId);
  const localId: string = coerceString(record.localId);
  const userId: number | null = coercePositiveInt(record.userId);
  const bookId: number | null = coercePositiveInt(record.bookId);
  const type = record.type === 'create' || record.type === 'delete' ? record.type : null;
  const createdAt: string = coerceString(record.createdAt);
  if (
    opId.length === 0 ||
    localId.length === 0 ||
    userId === null ||
    bookId === null ||
    type === null ||
    createdAt.length === 0
  ) {
    return null;
  }
  const attemptCount: number =
    typeof record.attemptCount === 'number' && Number.isFinite(record.attemptCount)
      ? Math.max(0, Math.floor(record.attemptCount))
      : 0;
  return {
    opId,
    userId,
    bookId,
    type,
    localId,
    serverId: coerceNullablePositiveInt(record.serverId),
    body: normalizeCreateBody(record.body),
    createdAt,
    attemptCount,
    lastAttemptAt: coerceNullableString(record.lastAttemptAt),
    lastError: coerceNullableString(record.lastError),
  };
}

function normalizeCreateBody(
  value: unknown,
): OfflineBookmarkPendingOp['body'] {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  return {
    spineIndex: coerceOptionalNonNegativeInt(record.spineIndex),
    scrollOffset: coerceOptionalNonNegativeInt(record.scrollOffset),
    spreadIndex: coerceOptionalNonNegativeInt(record.spreadIndex),
    pageNumber: coerceOptionalPositiveInt(record.pageNumber),
  };
}

function coercePositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
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

function coerceNullableNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

function coerceOptionalNonNegativeInt(value: unknown): number | undefined {
  const coerced: number | null = coerceNullableNonNegativeInt(value);
  return coerced === null ? undefined : coerced;
}

function coerceOptionalPositiveInt(value: unknown): number | undefined {
  const coerced: number | null = coerceNullablePositiveInt(value);
  return coerced === null ? undefined : coerced;
}

function coerceString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function coerceNullableString(value: unknown): string | null {
  const text: string = coerceString(value);
  return text.length === 0 ? null : text;
}

function coerceLayoutType(value: unknown): OfflineBookmarkRecord['layoutType'] | null {
  if (value === 'reflowable' || value === 'fixed_layout') {
    return value;
  }
  return null;
}
