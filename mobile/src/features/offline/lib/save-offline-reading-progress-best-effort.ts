import { readCurrentUserId } from '@/session/read-current-user-id';
import { upsertOfflineReadingProgress } from '@/features/offline/lib/offline-progress-storage';
import type { ReadingPositionSnapshot } from '@/features/reader/lib/reading-position';

/**
 * Best-effort local offline progress write. Never throws to the reader UI.
 */
export async function saveOfflineReadingProgressBestEffort(input: {
  readonly bookId: number;
  readonly position: ReadingPositionSnapshot;
}): Promise<void> {
  try {
    const userId: number | null = readCurrentUserId();
    if (userId === null) {
      return;
    }
    if (input.position.layoutType === 'reflowable') {
      await upsertOfflineReadingProgress({
        userId,
        bookId: input.bookId,
        layoutType: 'reflowable',
        spineIndex: input.position.spineIndex,
        scrollOffset: input.position.scrollOffset,
        spreadIndex: null,
        pageNumber: null,
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    await upsertOfflineReadingProgress({
      userId,
      bookId: input.bookId,
      layoutType: 'fixed_layout',
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: input.position.spreadIndex,
      pageNumber: input.position.pageNumber,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Local progress save is best-effort; reading continues if it fails.
  }
}
