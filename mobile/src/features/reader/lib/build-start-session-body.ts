import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import type { StartReadingSessionRequest } from '@/features/reader/api/start-reading-session';

export type BookLayoutType = 'reflowable' | 'fixed_layout';

/**
 * Builds the layout-correct start position for a new reading session.
 * Uses saved Smart Resume progress when present; otherwise layout defaults.
 */
export function buildStartSessionBody(
  layoutType: BookLayoutType,
  progress: ReadingProgress | null = null,
): StartReadingSessionRequest {
  if (layoutType === 'reflowable') {
    return {
      spineIndex: coerceNonNegativeInt(progress?.spineIndex, 0),
      scrollOffset: coerceNonNegativeInt(progress?.scrollOffset, 0),
    };
  }
  return {
    spreadIndex: coerceNonNegativeInt(progress?.spreadIndex, 0),
    pageNumber: coercePositiveInt(progress?.pageNumber, 1),
  };
}

function coerceNonNegativeInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

function coercePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}
