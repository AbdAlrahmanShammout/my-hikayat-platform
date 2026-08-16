import { resolveReadingChapterSpineIndex } from './resolve-reading-chapter-spine-index.helper';

describe('resolveReadingChapterSpineIndex', () => {
  it('uses the payload spine index when it is a non-negative integer', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(5, 1);
    expect(actualSpineIndex).toBe(5);
  });

  it('uses payload spine index 0 instead of the session spine index', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(0, 2);
    expect(actualSpineIndex).toBe(0);
  });

  it('falls back to the session spine index when the payload omits it', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(undefined, 2);
    expect(actualSpineIndex).toBe(2);
  });

  it('falls back to the session spine index when the payload is null', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(null, 3);
    expect(actualSpineIndex).toBe(3);
  });

  it('returns null when both values are missing', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(undefined, null);
    expect(actualSpineIndex).toBeNull();
  });

  it('returns null when the only candidate is negative', () => {
    const actualSpineIndex = resolveReadingChapterSpineIndex(-1, null);
    expect(actualSpineIndex).toBeNull();
  });
});
