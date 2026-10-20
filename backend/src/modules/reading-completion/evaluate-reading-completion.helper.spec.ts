import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { buildVirtualPages } from '@/modules/reading-completion/build-virtual-pages.helper';
import {
  computeTargetTimeMs,
  evaluateReadingCompletion,
} from '@/modules/reading-completion/evaluate-reading-completion.helper';

describe('computeTargetTimeMs', () => {
  it('adds a 6 second image pause per picture-book page', () => {
    const actualMs = computeTargetTimeMs({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      totalWords: 100,
      totalPages: 20,
    });
    expect(actualMs).toBe(270 * 1000);
  });

  it('uses 70 words per minute and no image pause for chapter books', () => {
    const actualMs = computeTargetTimeMs({
      layoutType: BookLayoutType.REFLOWABLE,
      totalWords: 10000,
      totalPages: 100,
    });
    expect(actualMs).toBeCloseTo((10000 / 70) * 60 * 1000, 5);
  });
});

describe('evaluateReadingCompletion', () => {
  it('completes a picture book at 80 percent of pages, the last page, and half the target time', () => {
    const pages = Array.from({ length: 16 }, (_, index) => ({
      pageIndex: index + 1,
      activeDurationMs: 9000,
    }));
    pages[15] = { pageIndex: 20, activeDurationMs: 9000 };
    const actual = evaluateReadingCompletion({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      totalPages: 20,
      totalWords: 100,
      pages,
    });
    expect(actual.qualifyingPageCount).toBe(16);
    expect(actual.lastPageReached).toBe(true);
    expect(actual.activeTimeMs).toBe(16 * 9000);
    expect(actual.isCompleted).toBe(true);
  });

  it('ignores picture-book page time below 4 seconds', () => {
    const actual = evaluateReadingCompletion({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      totalPages: 20,
      totalWords: 100,
      pages: [
        { pageIndex: 1, activeDurationMs: 3999 },
        { pageIndex: 20, activeDurationMs: 4000 },
      ],
    });
    expect(actual.qualifyingPageCount).toBe(1);
    expect(actual.activeTimeMs).toBe(4000);
    expect(actual.isCompleted).toBe(false);
  });

  it('counts a chapter page only after half of its expected word time', () => {
    const virtualPages = [{ pageIndex: 1, wordCount: 100 }];
    const tooShort = evaluateReadingCompletion({
      layoutType: BookLayoutType.REFLOWABLE,
      totalPages: 1,
      totalWords: 100,
      virtualPages,
      pages: [{ pageIndex: 1, activeDurationMs: 42 * 1000 }],
    });
    const longEnough = evaluateReadingCompletion({
      layoutType: BookLayoutType.REFLOWABLE,
      totalPages: 1,
      totalWords: 100,
      virtualPages,
      pages: [{ pageIndex: 1, activeDurationMs: 43 * 1000 }],
    });
    expect(tooShort.qualifyingPageCount).toBe(0);
    expect(longEnough.qualifyingPageCount).toBe(1);
    expect(longEnough.isCompleted).toBe(true);
  });
});

describe('buildVirtualPages', () => {
  it('puts the remainder on the last page', () => {
    const actualPages = buildVirtualPages(10000, 150);
    expect(actualPages).toHaveLength(67);
    expect(actualPages[0]).toEqual({ pageIndex: 1, wordCount: 150 });
    expect(actualPages[66]).toEqual({ pageIndex: 67, wordCount: 100 });
  });
});
