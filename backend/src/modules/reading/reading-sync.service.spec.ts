import { BookService } from '@/modules/book/book.service';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingBookmarkService } from '@/modules/reading/reading-bookmark.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { UserService } from '@/modules/user/user.service';

import { ReadingSyncService } from './reading-sync.service';

function createSampleProgress(): ReadingProgressEntity {
  return new ReadingProgressEntity({
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
}

function createSampleBookmark(): ReadingBookmarkEntity {
  return new ReadingBookmarkEntity({
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
}

describe('ReadingSyncService', () => {
  let mockReadingProgressService: { listReadingProgresses: jest.Mock };
  let mockReadingBookmarkService: { listReadingBookmarksForSync: jest.Mock };
  let mockBookService: { getBookById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let readingSyncService: ReadingSyncService;

  beforeEach(() => {
    mockReadingProgressService = { listReadingProgresses: jest.fn() };
    mockReadingBookmarkService = { listReadingBookmarksForSync: jest.fn() };
    mockBookService = { getBookById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    readingSyncService = new ReadingSyncService(
      mockReadingProgressService as unknown as ReadingProgressService,
      mockReadingBookmarkService as unknown as ReadingBookmarkService,
      mockBookService as unknown as BookService,
      mockUserService as unknown as UserService,
    );
  });

  it('pulls all progress and bookmarks for the reader', async () => {
    const expectedProgress = { entities: [createSampleProgress()], total: 1 };
    const expectedBookmarks = { entities: [createSampleBookmark()], total: 1 };
    mockUserService.getUserById.mockResolvedValue({ id: 7 });
    mockReadingProgressService.listReadingProgresses.mockResolvedValue(expectedProgress);
    mockReadingBookmarkService.listReadingBookmarksForSync.mockResolvedValue(expectedBookmarks);
    const actualSnapshot = await readingSyncService.getReadingSync({ userId: 7 });
    expect(mockBookService.getBookById).not.toHaveBeenCalled();
    expect(mockReadingProgressService.listReadingProgresses).toHaveBeenCalledWith({
      userId: 7,
      bookId: undefined,
      updatedSince: undefined,
    });
    expect(mockReadingBookmarkService.listReadingBookmarksForSync).toHaveBeenCalledWith({
      userId: 7,
      bookId: undefined,
      updatedSince: undefined,
    });
    expect(actualSnapshot.progress).toBe(expectedProgress);
    expect(actualSnapshot.bookmarks).toBe(expectedBookmarks);
  });

  it('scopes a book pull to that book after verifying it exists', async () => {
    const updatedSince = new Date('2026-08-15T00:00:00.000Z');
    mockUserService.getUserById.mockResolvedValue({ id: 7 });
    mockBookService.getBookById.mockResolvedValue({ id: 8 });
    mockReadingProgressService.listReadingProgresses.mockResolvedValue({
      entities: [createSampleProgress()],
      total: 1,
    });
    mockReadingBookmarkService.listReadingBookmarksForSync.mockResolvedValue({
      entities: [],
      total: 0,
    });
    await readingSyncService.getReadingSync({
      userId: 7,
      bookId: 8,
      updatedSince,
    });
    expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
    expect(mockReadingProgressService.listReadingProgresses).toHaveBeenCalledWith({
      userId: 7,
      bookId: 8,
      updatedSince,
    });
    expect(mockReadingBookmarkService.listReadingBookmarksForSync).toHaveBeenCalledWith({
      userId: 7,
      bookId: 8,
      updatedSince,
    });
  });
});
