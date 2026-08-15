import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';

import { GetReadingBookmarksResponseDto } from './get-reading-bookmarks-response.dto';

describe('GetReadingBookmarksResponseDto', () => {
  it('maps a bookmark page into the collection envelope', () => {
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
    const actualResponse = new GetReadingBookmarksResponseDto({
      entities: [inputEntity],
      total: 3,
    });
    expect(actualResponse.total).toBe(3);
    expect(actualResponse.bookmarks).toHaveLength(1);
    expect(actualResponse.bookmarks[0].id).toBe(5);
    expect(actualResponse.bookmarks[0].spineIndex).toBe(2);
  });
});
