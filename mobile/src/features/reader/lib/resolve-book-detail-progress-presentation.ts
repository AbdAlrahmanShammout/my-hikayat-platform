import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

import { formatContinueReadingLabel } from './continue-reading';

export type BookDetailProgressPresentation = {
  readonly label: string;
  readonly percent: number;
};

/**
 * Maps backend progress into the Figma book-detail bar. Hides when percent is 0 or unknown.
 */
export function resolveBookDetailProgressPresentation(
  progress: ReadingProgress,
): BookDetailProgressPresentation | null {
  const percent: number | null = resolveContentProgressPercent(progress.contentProgressPercent);
  if (percent === null || percent <= 0) {
    return null;
  }
  const locationLabel: string | null =
    typeof progress.locationLabel === 'string' && progress.locationLabel.trim() !== ''
      ? progress.locationLabel.trim()
      : null;
  return {
    label: locationLabel ?? formatContinueReadingLabel(progress),
    percent,
  };
}

function resolveContentProgressPercent(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.floor(value);
}
