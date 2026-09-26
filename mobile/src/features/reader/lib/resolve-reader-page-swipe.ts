export type ReaderPageSwipe = 'next' | 'previous';

const SWIPE_MIN_DISTANCE_PX = 48;

/**
 * A horizontal finger swipe turns the page. A vertical drag stays a scroll.
 * Swipe left moves forward, matching the next-page button on the right.
 */
export function resolveReaderPageSwipe(input: {
  readonly deltaX: number;
  readonly deltaY: number;
}): ReaderPageSwipe | null {
  if (Math.abs(input.deltaX) < SWIPE_MIN_DISTANCE_PX) {
    return null;
  }
  if (Math.abs(input.deltaX) <= Math.abs(input.deltaY)) {
    return null;
  }
  return input.deltaX < 0 ? 'next' : 'previous';
}
