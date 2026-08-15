import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';

import { ReadingBookmarkResponse } from './reading-bookmark.response';

describe('ReadingBookmarkResponse', () => {
  it('projects reflowable bookmark fields', () => {
    const inputEntity = new ReadingBookmarkEntity({
      id: 5,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      scrollOffset: 640,
      spreadIndex: null,
      pageNumber: null,
    });
    const actualResponse = new ReadingBookmarkResponse(inputEntity);
    expect(actualResponse.userId).toBe(7);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.spineIndex).toBe(2);
    expect(actualResponse.scrollOffset).toBe(640);
    expect(actualResponse.spreadIndex).toBeNull();
    expect(actualResponse.pageNumber).toBeNull();
  });
});
