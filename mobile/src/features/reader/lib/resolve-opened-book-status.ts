import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { formatContinueReadingLabel } from '@/features/reader/lib/continue-reading';

/**
 * Status line for an opened book. Prefers the server location label.
 */
export function resolveOpenedBookStatus(progress: ReadingProgress): string {
  if (typeof progress.locationLabel === 'string' && progress.locationLabel.trim().length > 0) {
    return progress.locationLabel.trim();
  }
  return formatContinueReadingLabel(progress);
}
