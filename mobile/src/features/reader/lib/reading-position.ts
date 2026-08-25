import type { EndReadingSessionRequest } from '@/features/reader/api/end-reading-session';
import type { SaveReadingProgressRequest } from '@/features/reader/api/save-reading-progress';

export type ReflowableReadingPosition = {
  readonly layoutType: 'reflowable';
  readonly spineIndex: number;
  readonly scrollOffset: number;
};

export type FixedLayoutReadingPosition = {
  readonly layoutType: 'fixed_layout';
  readonly spreadIndex: number;
  readonly pageNumber: number;
};

export type ReadingPositionSnapshot =
  | ReflowableReadingPosition
  | FixedLayoutReadingPosition;

/**
 * Maps a live engine position into a Smart Resume progress body.
 */
export function toSaveProgressBody(
  position: ReadingPositionSnapshot,
): SaveReadingProgressRequest {
  if (position.layoutType === 'reflowable') {
    return {
      spineIndex: position.spineIndex,
      scrollOffset: position.scrollOffset,
    };
  }
  return {
    spreadIndex: position.spreadIndex,
    pageNumber: position.pageNumber,
  };
}

/**
 * Maps a live engine position into an end-session body.
 */
export function toEndSessionBody(position: ReadingPositionSnapshot): EndReadingSessionRequest {
  return toSaveProgressBody(position);
}
