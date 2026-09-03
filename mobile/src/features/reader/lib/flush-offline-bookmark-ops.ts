import { createReadingBookmark } from '@/features/reader/api/create-reading-bookmark';
import { deleteReadingBookmark } from '@/features/reader/api/delete-reading-bookmark';
import {
  OFFLINE_BOOKMARK_MAX_ATTEMPTS,
  listOfflineBookmarkPendingOps,
  markOfflineBookmarkOpAttempt,
  removeOfflineBookmarkPendingOp,
  upsertOfflineBookmark,
} from '@/features/reader/lib/offline-bookmark-storage';
import { readCurrentUserId } from '@/session/read-current-user-id';
import { fetchConnectivitySnapshot } from '@/native/connectivity/net-info-adapter';

let isFlushInFlight = false;

/**
 * Flushes pending offline bookmark create/delete ops when online.
 * Best-effort; bounded retries; never throws to UI.
 */
export async function flushOfflineBookmarkOpsBestEffort(): Promise<void> {
  if (isFlushInFlight) {
    return;
  }
  isFlushInFlight = true;
  try {
    const connectivity = await fetchConnectivitySnapshot();
    if (!connectivity.isOnline) {
      return;
    }
    const userId: number | null = readCurrentUserId();
    if (userId === null) {
      return;
    }
    const pendingOps = await listOfflineBookmarkPendingOps(userId);
    for (const op of pendingOps) {
      if (op.attemptCount >= OFFLINE_BOOKMARK_MAX_ATTEMPTS) {
        continue;
      }
      try {
        if (op.type === 'create') {
          const created = await createReadingBookmark({
            bookId: op.bookId,
            body: op.body ?? {},
          });
          await upsertOfflineBookmark({
            localId: op.localId,
            userId: op.userId,
            bookId: op.bookId,
            serverId: created.id,
            layoutType: created.layoutType,
            spineIndex: coerceOptionalNumber(created.spineIndex),
            scrollOffset: coerceOptionalNumber(created.scrollOffset),
            spreadIndex: coerceOptionalNumber(created.spreadIndex),
            pageNumber: coerceOptionalNumber(created.pageNumber),
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          });
          await removeOfflineBookmarkPendingOp(op.opId);
          continue;
        }
        if (op.serverId === null) {
          await removeOfflineBookmarkPendingOp(op.opId);
          continue;
        }
        await deleteReadingBookmark({
          bookId: op.bookId,
          bookmarkId: op.serverId,
        });
        await removeOfflineBookmarkPendingOp(op.opId);
      } catch (error: unknown) {
        await markOfflineBookmarkOpAttempt({
          opId: op.opId,
          attemptCount: op.attemptCount + 1,
          lastAttemptAt: new Date().toISOString(),
          lastError: error instanceof Error ? error.message : 'Bookmark sync failed.',
        });
      }
    }
  } catch {
    // Flush is best-effort.
  } finally {
    isFlushInFlight = false;
  }
}

function coerceOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}
