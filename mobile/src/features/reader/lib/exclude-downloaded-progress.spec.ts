import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

import { excludeDownloadedProgress } from './exclude-downloaded-progress';

function createProgress(bookId: number): ReadingProgress {
  return {
    id: bookId,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 2,
    bookId,
    layoutType: 'reflowable',
    spineIndex: 0,
    scrollOffset: 0,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('excludeDownloadedProgress', () => {
  it('keeps opened books that are not downloaded', () => {
    const actual = excludeDownloadedProgress(
      [createProgress(1), createProgress(2), createProgress(3)],
      new Set([2]),
    );
    expect(actual.map((item) => item.bookId)).toEqual([1, 3]);
  });
});
