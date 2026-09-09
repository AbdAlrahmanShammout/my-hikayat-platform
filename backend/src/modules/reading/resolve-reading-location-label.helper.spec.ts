import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { resolveReadingLocationLabel } from './resolve-reading-location-label.helper';

describe('resolveReadingLocationLabel', () => {
  it('prefers the chapter title for reflowable progress', () => {
    const actualLabel = resolveReadingLocationLabel({
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 8,
      chapterTitle: 'The Harbor',
      pageNumber: null,
      pageCount: 0,
      spreadIndex: null,
      spreadCount: 0,
    });
    expect(actualLabel).toBe('The Harbor');
  });

  it('uses page counts for fixed-layout progress', () => {
    const actualLabel = resolveReadingLocationLabel({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spineIndex: null,
      chapterTitle: null,
      pageNumber: 3,
      pageCount: 12,
      spreadIndex: 1,
      spreadCount: 6,
    });
    expect(actualLabel).toBe('Page 3 of 12');
  });
});
