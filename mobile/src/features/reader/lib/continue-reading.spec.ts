import {
  formatContinueReadingLabel,
  sortProgressByLastSession,
} from '@/features/reader/lib/continue-reading';
import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';

describe('continueReading helpers', () => {
  const older: ReadingProgress = {
    id: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 2,
    bookId: 8,
    layoutType: 'reflowable',
    spineIndex: 1,
    scrollOffset: 10,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: '2026-01-01T12:00:00.000Z',
  };
  const newer: ReadingProgress = {
    id: 2,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    userId: 2,
    bookId: 9,
    layoutType: 'fixed_layout',
    spineIndex: null,
    scrollOffset: null,
    spreadIndex: 3,
    pageNumber: 4,
    lastSessionAt: '2026-01-03T12:00:00.000Z',
  };

  it('sorts progress by lastSessionAt descending', () => {
    expect(sortProgressByLastSession([older, newer]).map((item) => item.id)).toEqual([2, 1]);
  });

  it('formats layout-aware continue labels', () => {
    expect(formatContinueReadingLabel(older)).toBe('Continue · chapter 2');
    expect(formatContinueReadingLabel(newer)).toBe('Continue · spread 4');
  });
});
