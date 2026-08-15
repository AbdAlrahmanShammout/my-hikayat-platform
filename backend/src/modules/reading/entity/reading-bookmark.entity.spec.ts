import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingBookmarkEntity } from './reading-bookmark.entity';

describe('ReadingBookmarkEntity', () => {
  it('holds a reflowable chapter position and scroll offset', () => {
    const actualEntity = new ReadingBookmarkEntity({
      id: 5,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      scrollOffset: 480,
      spreadIndex: null,
      pageNumber: null,
    });
    expect(actualEntity.userId).toBe(4);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.spineIndex).toBe(2);
    expect(actualEntity.scrollOffset).toBe(480);
    expect(actualEntity.spreadIndex).toBeNull();
  });
});
