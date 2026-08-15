import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressType } from '@/modules/reading/types/reading-progress-details-schema.type';

import { ReadingProgressMapper } from './reading-progress.mapper';

describe('ReadingProgressMapper', () => {
  it('maps a persistence payload onto a ReadingProgressEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const lastSessionAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: ReadingProgressType = {
      id: 3,
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
      lastSessionAt,
    };
    const actualEntity = ReadingProgressMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(3);
    expect(actualEntity.layoutType).toBe(BookLayoutType.FIXED_LAYOUT);
    expect(actualEntity.spreadIndex).toBe(1);
    expect(actualEntity.pageNumber).toBe(3);
    expect(actualEntity.spineIndex).toBeNull();
    expect(actualEntity.lastSessionAt).toBe(lastSessionAt);
  });
});
