import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';

import { GetReadingSyncResponseDto } from './get-reading-sync-response.dto';

describe('GetReadingSyncResponseDto', () => {
  it('maps progress and bookmark pages into the sync envelope', () => {
    const inputProgress = new ReadingProgressEntity({
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
    const inputBookmark = new ReadingBookmarkEntity({
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
    const actualResponse = new GetReadingSyncResponseDto({
      progress: { entities: [inputProgress], total: 1 },
      bookmarks: { entities: [inputBookmark], total: 2 },
    });
    expect(actualResponse.progressTotal).toBe(1);
    expect(actualResponse.bookmarksTotal).toBe(2);
    expect(actualResponse.progress).toHaveLength(1);
    expect(actualResponse.bookmarks).toHaveLength(1);
    expect(actualResponse.progress[0].spineIndex).toBe(2);
    expect(actualResponse.bookmarks[0].id).toBe(5);
  });
});
