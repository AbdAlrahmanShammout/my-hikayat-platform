import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkEntity } from '@/modules/reading/entity/reading-bookmark.entity';
import { ReadingProgressEntity } from '@/modules/reading/entity/reading-progress.entity';
import { ReadingBookmarkService } from '@/modules/reading/reading-bookmark.service';
import { ReadingProgressService } from '@/modules/reading/reading-progress.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { ReadingReaderController } from './reading.reader.controller';

function createSampleReader(): UserEntity {
  return new UserEntity({
    id: 7,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

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

describe('ReadingReaderController', () => {
  let readingReaderController: ReadingReaderController;
  let mockReadingProgressService: {
    saveReadingProgress: jest.Mock;
    getReadingProgressByUserAndBook: jest.Mock;
  };
  let mockReadingBookmarkService: {
    createReadingBookmark: jest.Mock;
    listReadingBookmarks: jest.Mock;
    deleteReadingBookmark: jest.Mock;
  };

  beforeEach(async () => {
    mockReadingProgressService = {
      saveReadingProgress: jest.fn(),
      getReadingProgressByUserAndBook: jest.fn(),
    };
    mockReadingBookmarkService = {
      createReadingBookmark: jest.fn(),
      listReadingBookmarks: jest.fn(),
      deleteReadingBookmark: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReadingReaderController],
      providers: [
        { provide: ReadingBookmarkService, useValue: mockReadingBookmarkService },
        { provide: ReadingProgressService, useValue: mockReadingProgressService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    readingReaderController = moduleRef.get(ReadingReaderController);
  });

  describe('saveReadingProgress', () => {
    it('maps the book id, principal, and position fields into the progress service', async () => {
      const expectedProgress = createSampleProgress();
      mockReadingProgressService.saveReadingProgress.mockResolvedValue(expectedProgress);
      const actualResponse = await readingReaderController.saveReadingProgress(
        8,
        { spineIndex: 2, scrollOffset: 640 },
        createSampleReader(),
      );
      expect(mockReadingProgressService.saveReadingProgress).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        spineIndex: 2,
        scrollOffset: 640,
        spreadIndex: undefined,
        pageNumber: undefined,
      });
      expect(actualResponse.id).toBe(3);
      expect(actualResponse.userId).toBe(7);
      expect(actualResponse.bookId).toBe(8);
      expect(actualResponse.layoutType).toBe(BookLayoutType.REFLOWABLE);
      expect(actualResponse.spineIndex).toBe(2);
      expect(actualResponse.scrollOffset).toBe(640);
      expect(actualResponse).not.toHaveProperty('passwordHash');
    });
  });

  describe('getReadingProgress', () => {
    it('loads the authenticated reader position for the book', async () => {
      const expectedProgress = createSampleProgress();
      mockReadingProgressService.getReadingProgressByUserAndBook.mockResolvedValue(
        expectedProgress,
      );
      const actualResponse = await readingReaderController.getReadingProgress(
        8,
        createSampleReader(),
      );
      expect(mockReadingProgressService.getReadingProgressByUserAndBook).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
      });
      expect(actualResponse.id).toBe(3);
      expect(actualResponse.spineIndex).toBe(2);
      expect(actualResponse.scrollOffset).toBe(640);
    });
  });

  describe('createReadingBookmark', () => {
    it('maps the book id, principal, and position fields into the bookmark service', async () => {
      const expectedBookmark = createSampleBookmark();
      mockReadingBookmarkService.createReadingBookmark.mockResolvedValue(expectedBookmark);
      const actualResponse = await readingReaderController.createReadingBookmark(
        8,
        { spineIndex: 2, scrollOffset: 640 },
        createSampleReader(),
      );
      expect(mockReadingBookmarkService.createReadingBookmark).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        spineIndex: 2,
        scrollOffset: 640,
        spreadIndex: undefined,
        pageNumber: undefined,
      });
      expect(actualResponse.id).toBe(5);
      expect(actualResponse.spineIndex).toBe(2);
      expect(actualResponse.scrollOffset).toBe(640);
    });
  });

  describe('listReadingBookmarks', () => {
    it('lists bookmarks for the authenticated reader and book', async () => {
      const expectedBookmark = createSampleBookmark();
      mockReadingBookmarkService.listReadingBookmarks.mockResolvedValue({
        entities: [expectedBookmark],
        total: 1,
      });
      const actualResponse = await readingReaderController.listReadingBookmarks(
        8,
        { limit: 10, offset: 0 },
        createSampleReader(),
      );
      expect(mockReadingBookmarkService.listReadingBookmarks).toHaveBeenCalledWith({
        userId: 7,
        bookId: 8,
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.bookmarks[0].id).toBe(5);
    });
  });

  describe('deleteReadingBookmark', () => {
    it('deletes the named bookmark for the authenticated reader and book', async () => {
      const expectedBookmark = createSampleBookmark();
      mockReadingBookmarkService.deleteReadingBookmark.mockResolvedValue(expectedBookmark);
      const actualResponse = await readingReaderController.deleteReadingBookmark(
        8,
        5,
        createSampleReader(),
      );
      expect(mockReadingBookmarkService.deleteReadingBookmark).toHaveBeenCalledWith({
        id: 5,
        userId: 7,
        bookId: 8,
      });
      expect(actualResponse.id).toBe(5);
    });
  });
});
