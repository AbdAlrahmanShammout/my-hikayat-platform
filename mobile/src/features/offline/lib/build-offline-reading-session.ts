import type { ReadingSession } from '@/features/reader/api/start-reading-session';
import type { OfflineBookManifest } from '@/features/offline/types/offline-book-manifest';

export const OFFLINE_READING_SESSION_ID = 0 as const;

/**
 * Builds a local reading session stub for offline-only opens (no server session).
 */
export function buildOfflineReadingSession(manifest: OfflineBookManifest): ReadingSession {
  const now: string = new Date().toISOString();
  if (manifest.layoutType === 'reflowable') {
    return {
      id: OFFLINE_READING_SESSION_ID,
      userId: 0,
      bookId: manifest.bookId,
      layoutType: 'reflowable',
      startedAt: now,
      endedAt: null,
      activeDurationMs: 0,
      idleDurationMs: 0,
      spineIndex: 0,
      scrollOffset: 0,
      spreadIndex: null,
      pageNumber: null,
      createdAt: now,
      updatedAt: now,
    };
  }
  return {
    id: OFFLINE_READING_SESSION_ID,
    userId: 0,
    bookId: manifest.bookId,
    layoutType: 'fixed_layout',
    startedAt: now,
    endedAt: null,
    activeDurationMs: 0,
    idleDurationMs: 0,
    spineIndex: null,
    scrollOffset: null,
    spreadIndex: 0,
    pageNumber: 1,
    createdAt: now,
    updatedAt: now,
  };
}
