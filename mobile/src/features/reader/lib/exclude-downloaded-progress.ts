import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

/**
 * Drops opened books that already appear in the offline download list.
 */
export function excludeDownloadedProgress(
  progress: readonly ReadingProgress[],
  downloadedBookIds: ReadonlySet<number>,
): ReadingProgress[] {
  return progress.filter((item) => !downloadedBookIds.has(item.bookId));
}
