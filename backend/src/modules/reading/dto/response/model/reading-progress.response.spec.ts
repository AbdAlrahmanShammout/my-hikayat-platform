import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

import { ReadingProgressResponse } from './reading-progress.response';

describe('ReadingProgressResponse', () => {
  it('projects reflowable position fields and omits a password hash', () => {
    const inputEntity = new ReadingProgressEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      userId: 7,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      scrollOffset: 640,
      spreadIndex: null,
      pageNumber: null,
      lastSessionAt: new Date('2026-08-15T02:00:00.000Z'),
    });
    const actualResponse = new ReadingProgressResponse(inputEntity);
    expect(actualResponse.userId).toBe(7);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.spineIndex).toBe(2);
    expect(actualResponse.scrollOffset).toBe(640);
    expect(actualResponse.spreadIndex).toBeNull();
    expect(actualResponse.pageNumber).toBeNull();
    expect(actualResponse.lastSessionAt).toEqual(new Date('2026-08-15T02:00:00.000Z'));
  });
});
