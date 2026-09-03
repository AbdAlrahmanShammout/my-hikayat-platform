import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';
import type { OfflineReadingProgressRecord } from '@/features/offline/types/offline-reading-progress-record';

export const OFFLINE_READING_SESSION_ID = 0 as const;

/**
 * Builds a local reading session stub for offline-only opens (no server session).
 * Seeds position from local offline progress when available.
 */
export function buildOfflineReadingSession(
  manifest: OfflineBookManifest,
  progress: OfflineReadingProgressRecord | null = null,
): ReadingSession {
  const now: string = new Date().toISOString();
  const userId: number = progress?.userId ?? 0;
  if (manifest.layoutType === 'reflowable') {
    return {
      id: OFFLINE_READING_SESSION_ID,
      userId,
      bookId: manifest.bookId,
      layoutType: 'reflowable',
      startedAt: now,
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spineIndex: coerceNonNegativeInt(progress?.spineIndex, 0),
      scrollOffset: coerceNonNegativeInt(progress?.scrollOffset, 0),
      spreadIndex: null,
      pageNumber: null,
      createdAt: now,
      updatedAt: now,
    };
  }
  return {
    id: OFFLINE_READING_SESSION_ID,
    userId,
    bookId: manifest.bookId,
    layoutType: 'fixed_layout',
    startedAt: now,
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: null,
    scrollOffset: null,
    spreadIndex: coerceNonNegativeInt(progress?.spreadIndex, 0),
    pageNumber: coercePositiveInt(progress?.pageNumber, 1),
    createdAt: now,
    updatedAt: now,
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
