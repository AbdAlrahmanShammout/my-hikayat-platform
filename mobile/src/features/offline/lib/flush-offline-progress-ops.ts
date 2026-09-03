import { getReadingProgress } from '@/features/reader/api/get-reading-progress';
import { saveReadingProgress } from '@/features/reader/api/save-reading-progress';
import {
  listPendingOfflineReadingProgress,
  markOfflineReadingProgressSynced,
  upsertOfflineReadingProgress,
} from '@/features/offline/lib/offline-progress-storage';
import type { OfflineReadingProgressRecord } from '@/features/offline/types/offline-reading-progress-record';
import { fetchConnectivitySnapshot } from '@/native/connectivity/net-info-adapter';
import { readCurrentUserId } from '@/session/read-current-user-id';

const OFFLINE_PROGRESS_MAX_FLUSH_FAILURES = 5 as const;

let isFlushInFlight = false;
const flushFailureCounts = new Map<string, number>();

/**
 * Uploads pending local offline progress when online.
 * Conflict rule: newer timestamp wins (local `updatedAt` vs server `lastSessionAt`).
 */
export async function flushOfflineProgressOpsBestEffort(): Promise<void> {
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
    const pending: readonly OfflineReadingProgressRecord[] =
      await listPendingOfflineReadingProgress(userId);
    for (const record of pending) {
      const failureKey: string = `${record.userId}:${record.bookId}`;
      const failures: number = flushFailureCounts.get(failureKey) ?? 0;
      if (failures >= OFFLINE_PROGRESS_MAX_FLUSH_FAILURES) {
        continue;
      }
      try {
        const shouldUpload: boolean = await shouldUploadLocalProgress(record);
        if (!shouldUpload) {
          await markOfflineReadingProgressSynced(record.userId, record.bookId);
          flushFailureCounts.delete(failureKey);
          continue;
        }
        await saveReadingProgress({
          bookId: record.bookId,
          body: toSaveBody(record),
        });
        await markOfflineReadingProgressSynced(record.userId, record.bookId);
        flushFailureCounts.delete(failureKey);
      } catch (error: unknown) {
        flushFailureCounts.set(failureKey, failures + 1);
        void error;
      }
    }
  } catch {
    // Flush is best-effort.
  } finally {
    isFlushInFlight = false;
  }
}

async function shouldUploadLocalProgress(
  local: OfflineReadingProgressRecord,
): Promise<boolean> {
  try {
    const server = await getReadingProgress(local.bookId);
    const serverMs: number = Date.parse(server.lastSessionAt || server.updatedAt);
    const localMs: number = Date.parse(local.updatedAt);
    if (Number.isFinite(serverMs) && Number.isFinite(localMs) && serverMs > localMs) {
      await upsertOfflineReadingProgress({
        userId: local.userId,
        bookId: local.bookId,
        layoutType: server.layoutType,
        spineIndex: coerceOptionalNumber(server.spineIndex),
        scrollOffset: coerceOptionalNumber(server.scrollOffset),
        spreadIndex: coerceOptionalNumber(server.spreadIndex),
        pageNumber: coerceOptionalNumber(server.pageNumber),
        updatedAt: server.lastSessionAt || server.updatedAt,
        pendingSync: false,
      });
      return false;
    }
    return true;
  } catch {
    // Missing server progress (404) or transient errors → attempt upload.
    return true;
  }
}

function toSaveBody(record: OfflineReadingProgressRecord): {
  readonly spineIndex?: number;
  readonly scrollOffset?: number;
  readonly spreadIndex?: number;
  readonly pageNumber?: number;
} {
  if (record.layoutType === 'reflowable') {
    return {
      spineIndex: record.spineIndex ?? 0,
      scrollOffset: record.scrollOffset ?? 0,
    };
  }
  return {
    spreadIndex: record.spreadIndex ?? 0,
    pageNumber: record.pageNumber ?? 1,
  };
}

function coerceOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return value;
}
