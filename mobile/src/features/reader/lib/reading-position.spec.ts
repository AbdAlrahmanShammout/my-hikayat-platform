import {
  toEndSessionBody,
  toSaveProgressBody,
  type ReadingPositionSnapshot,
} from '@/features/reader/lib/reading-position';

describe('readingPosition mappers', () => {
  it('maps reflowable positions', () => {
    const input: ReadingPositionSnapshot = {
      layoutType: 'reflowable',
      spineIndex: 2,
      scrollOffset: 90,
    };
    expect(toSaveProgressBody(input)).toEqual({ spineIndex: 2, scrollOffset: 90 });
    expect(toEndSessionBody(input)).toEqual({ spineIndex: 2, scrollOffset: 90 });
  });

  it('maps fixed-layout positions', () => {
    const input: ReadingPositionSnapshot = {
      layoutType: 'fixed_layout',
      spreadIndex: 1,
      pageNumber: 3,
    };
    expect(toSaveProgressBody(input)).toEqual({ spreadIndex: 1, pageNumber: 3 });
  });
});
