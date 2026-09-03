import type { ReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { createReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { deleteReadingBookmark } from '@/features/reader/api/delete-reading-bookmark';
import { listReadingBookmarkItems } from '@/features/reader/api/list-reading-bookmarks';
import {
  cancelPendingOfflineBookmarkCreate,
  enqueueOfflineBookmarkOp,
  listOfflineBookmarksForBook,
  reconcileOfflineBookmarksWithServer,
  removeOfflineBookmark,
  upsertOfflineBookmark,
} from '@/features/reader/lib/offline-bookmark-storage';
import { flushOfflineBookmarkOpsBestEffort } from '@/features/reader/lib/flush-offline-bookmark-ops';
import type { OfflineBookmarkRecord } from '@/features/reader/types/offline-bookmark-record';
import { readCurrentUserId } from '@/session/read-current-user-id';
import { fetchConnectivitySnapshot } from '@/native/connectivity/net-info-adapter';

export type ReaderBookmarkListItem = {
  readonly localId: string;
  readonly serverId: number | null;
  readonly bookmark: ReadingBookmark;
};

export type ReaderBookmarkPositionInput =
  | { readonly kind: 'reflowable'; readonly spineIndex: number; readonly scrollOffset: number }
  | { readonly kind: 'fixed_layout'; readonly spreadIndex: number; readonly pageNumber: number };

/**
 * Loads bookmarks for the reader panel: server when online, local when offline.
 */
export async function loadReaderBookmarks(bookId: number): Promise<readonly ReaderBookmarkListItem[]> {
  const userId: number | null = readCurrentUserId();
  if (userId === null) {
    return [];
  }
  const connectivity = await fetchConnectivitySnapshot();
  if (connectivity.isOnline) {
    try {
      const serverItems: readonly ReadingBookmark[] = await listReadingBookmarkItems(bookId);
      const serverRecords: OfflineBookmarkRecord[] = serverItems.map((item) =>
        toOfflineRecordFromServer(userId, item),
      );
      await reconcileOfflineBookmarksWithServer({
        userId,
        bookId,
        serverBookmarks: serverRecords,
      });
      void flushOfflineBookmarkOpsBestEffort();
    } catch {
      // Fall through to local store when the list request fails.
    }
  }
  const localRows: readonly OfflineBookmarkRecord[] = await listOfflineBookmarksForBook(
    userId,
    bookId,
  );
  return localRows
    .slice()
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((row) => ({
      localId: row.localId,
      serverId: row.serverId,
      bookmark: toReadingBookmark(row),
    }));
}

/**
 * Adds a bookmark online when possible; otherwise stores locally and queues sync.
 */
export async function addReaderBookmark(input: {
  readonly bookId: number;
  readonly layoutType: 'reflowable' | 'fixed_layout';
  readonly position: ReaderBookmarkPositionInput;
}): Promise<void> {
  const userId: number | null = readCurrentUserId();
  if (userId === null) {
    throw new Error('Could not save that bookmark.');
  }
  const now: string = new Date().toISOString();
  const localId: string = createClientId();
  const body = buildCreateBody(input.position);
  const connectivity = await fetchConnectivitySnapshot();
  if (connectivity.isOnline) {
    try {
      const created: ReadingBookmark = await createReadingBookmark({
        bookId: input.bookId,
        body,
      });
      await upsertOfflineBookmark(toOfflineRecordFromServer(userId, created, localId));
      return;
    } catch {
      // Fall through to offline create.
    }
  }
  await upsertOfflineBookmark({
    localId,
    userId,
    bookId: input.bookId,
    serverId: null,
    layoutType: input.layoutType,
    spineIndex: body.spineIndex ?? null,
    scrollOffset: body.scrollOffset ?? null,
    spreadIndex: body.spreadIndex ?? null,
    pageNumber: body.pageNumber ?? null,
    createdAt: now,
    updatedAt: now,
  });
  await enqueueOfflineBookmarkOp({
    opId: createClientId(),
    userId,
    bookId: input.bookId,
    type: 'create',
    localId,
    serverId: null,
    body,
    createdAt: now,
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
  });
}

/**
 * Removes a bookmark online when possible; cancels pending create or queues delete.
 */
export async function removeReaderBookmark(input: {
  readonly bookId: number;
  readonly localId: string;
  readonly serverId: number | null;
}): Promise<void> {
  const userId: number | null = readCurrentUserId();
  if (userId === null) {
    throw new Error('Could not remove that bookmark.');
  }
  if (input.serverId === null) {
    await removeOfflineBookmark(userId, input.localId);
    await cancelPendingOfflineBookmarkCreate(userId, input.localId);
    return;
  }
  const connectivity = await fetchConnectivitySnapshot();
  if (connectivity.isOnline) {
    try {
      await deleteReadingBookmark({
        bookId: input.bookId,
        bookmarkId: input.serverId,
      });
      await removeOfflineBookmark(userId, input.localId);
      return;
    } catch {
      // Fall through to queued delete.
    }
  }
  await removeOfflineBookmark(userId, input.localId);
  await enqueueOfflineBookmarkOp({
    opId: createClientId(),
    userId,
    bookId: input.bookId,
    type: 'delete',
    localId: input.localId,
    serverId: input.serverId,
    body: null,
    createdAt: new Date().toISOString(),
    attemptCount: 0,
    lastAttemptAt: null,
    lastError: null,
  });
}

function buildCreateBody(position: ReaderBookmarkPositionInput): {
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly spreadIndex?: number;
  readonly pageNumber?: number;
} {
  if (position.kind === 'reflowable') {
    return {
      spineIndex: position.spineIndex,
      scrollOffset: position.scrollOffset,
    };
  }
  return {
    spreadIndex: position.spreadIndex,
    pageNumber: position.pageNumber,
  };
}

function toOfflineRecordFromServer(
  userId: number,
  bookmark: ReadingBookmark,
  localId: string = `server-${bookmark.id}`,
): OfflineBookmarkRecord {
  return {
    localId,
    userId,
    bookId: bookmark.bookId,
    serverId: bookmark.id,
    layoutType: bookmark.layoutType,
    spineIndex: coerceOptionalNumber(bookmark.spineIndex),
    scrollOffset: coerceOptionalNumber(bookmark.scrollOffset),
    spreadIndex: coerceOptionalNumber(bookmark.spreadIndex),
    pageNumber: coerceOptionalNumber(bookmark.pageNumber),
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
  };
}

function toReadingBookmark(record: OfflineBookmarkRecord): ReadingBookmark {
  return {
    id: record.serverId ?? toTemporaryDisplayId(record.localId),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    userId: record.userId,
    bookId: record.bookId,
    layoutType: record.layoutType,
    spineIndex: record.spineIndex ?? undefined,
    scrollOffset: record.scrollOffset ?? undefined,
    spreadIndex: record.spreadIndex ?? undefined,
    pageNumber: record.pageNumber ?? undefined,
  };
}

function coerceOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function toTemporaryDisplayId(localId: string): number {
  let hash = 0;
  for (let index = 0; index < localId.length; index += 1) {
    hash = (hash * 31 + localId.charCodeAt(index)) | 0;
  }
  const positive: number = Math.abs(hash) % 1_000_000_000;
  return -1 - positive;
}

function createClientId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `op-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}
