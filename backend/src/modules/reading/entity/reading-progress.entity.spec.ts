import { BookLayoutType } from '@/modules/book/enum/general.enum';

import { ReadingProgressEntity } from './reading-progress.entity';

describe('ReadingProgressEntity', () => {
  it('holds a reflowable chapter position and scroll offset', () => {
    const actualEntity = new ReadingProgressEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 2,
      scrollOffset: 480,
      spreadIndex: null,
      pageNumber: null,
      lastSessionAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    expect(actualEntity.userId).toBe(4);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.spineIndex).toBe(2);
    expect(actualEntity.scrollOffset).toBe(480);
    expect(actualEntity.spreadIndex).toBeNull();
  });
});
