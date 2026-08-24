import type { StartReadingSessionRequest } from '@/features/reader/api/start-reading-session';

export type BookLayoutType = 'reflowable' | 'fixed_layout';

/**
 * Builds the layout-correct default start position for a new reading session.
 * Position rules stay aligned with the backend contract; no client inventions.
 */
export function buildStartSessionBody(layoutType: BookLayoutType): StartReadingSessionRequest {
  if (layoutType === 'reflowable') {
    return {
      spineIndex: 0,
      scrollOffset: 0,
    };
  }
  return {
    spreadIndex: 0,
    pageNumber: 1,
  };
}
