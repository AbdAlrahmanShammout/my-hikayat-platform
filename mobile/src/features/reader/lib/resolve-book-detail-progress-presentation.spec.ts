import type { ReadingProgress } from '@/features/reader/api/get-reading-progress';
import { resolveBookDetailProgressPresentation } from '@/features/reader/lib/resolve-book-detail-progress-presentation';

function createProgress(overrides: Partial<ReadingProgress> = {}): ReadingProgress {
  return {
    id: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    userId: 7,
    bookId: 8,
    layoutType: 'reflowable',
    spineIndex: 2,
    scrollOffset: 10,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt: '2026-08-15T02:00:00.000Z',
    ...overrides,
  };
}

describe('resolveBookDetailProgressPresentation', () => {
  it('hides the bar when percent is missing or zero', () => {
    expect(resolveBookDetailProgressPresentation(createProgress())).toBeNull();
    expect(
      resolveBookDetailProgressPresentation(createProgress({ contentProgressPercent: 0 })),
    ).toBeNull();
  });

  it('uses the backend location label and clamped percent', () => {
    const actualPresentation = resolveBookDetailProgressPresentation(
      createProgress({
        contentProgressPercent: 42.8,
        locationLabel: 'Harbor',
      }),
    );
    expect(actualPresentation).toEqual({
      label: 'Harbor',
      percent: 42,
    });
  });

  it('falls back to the continue label when location is empty', () => {
    const actualPresentation = resolveBookDetailProgressPresentation(
      createProgress({
        contentProgressPercent: 10,
        locationLabel: '  ',
      }),
    );
    expect(actualPresentation?.label).toBe('Continue · chapter 3');
    expect(actualPresentation?.percent).toBe(10);
  });
});
