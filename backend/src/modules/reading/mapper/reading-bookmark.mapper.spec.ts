import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkType } from '@/modules/reading/types/reading-bookmark-details-schema.type';

import { ReadingBookmarkMapper } from './reading-bookmark.mapper';

describe('ReadingBookmarkMapper', () => {
  it('maps a persistence payload onto a ReadingBookmarkEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: ReadingBookmarkType = {
      id: 5,
      createdAt,
      updatedAt,
      deletedAt: null,
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spineIndex: null,
      scrollOffset: null,
      spreadIndex: 1,
      pageNumber: 3,
    };
    const actualEntity = ReadingBookmarkMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(5);
    expect(actualEntity.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualEntity.spreadIndex).toBe(1);
    expect(actualEntity.pageNumber).toBe(3);
    expect(actualEntity.spineIndex).toBeNull();
  });
});
