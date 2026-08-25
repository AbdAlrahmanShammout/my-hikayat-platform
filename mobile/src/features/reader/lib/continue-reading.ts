import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

/**
 * Sorts progress rows newest-first for Continue Reading.
 */
export function sortProgressByLastSession(
  progress: readonly ReadingProgress[],
): ReadingProgress[] {
  return [...progress].sort((left, right) => {
    const leftAt: number = Date.parse(left.lastSessionAt);
    const rightAt: number = Date.parse(right.lastSessionAt);
    return rightAt - leftAt;
  });
}

/**
 * Builds a short kids-friendly resume label from layout-discriminated progress.
 */
export function formatContinueReadingLabel(progress: ReadingProgress): string {
  if (progress.layoutType === 'reflowable') {
    const chapter: number =
      typeof progress.spineIndex === 'number' ? progress.spineIndex + 1 : 1;
    return `Continue · chapter ${chapter}`;
  }
  const spread: number =
    typeof progress.spreadIndex === 'number' ? progress.spreadIndex + 1 : 1;
  return `Continue · spread ${spread}`;
}
