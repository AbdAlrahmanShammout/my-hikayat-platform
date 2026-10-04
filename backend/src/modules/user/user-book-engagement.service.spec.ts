import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookProcessingStatus, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookProcessingService } from '@/modules/book-processing/book-processing.service';
import { ReadingChapterEngagementService } from '@/modules/reading-intelligence/reading-chapter-engagement.service';
import { ReadingVisualEngagementService } from '@/modules/reading-intelligence/reading-visual-engagement.service';
import { ReadingSessionTotalsService } from '@/modules/reading/reading-session-totals.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserBookEngagementService } from '@/modules/user/user-book-engagement.service';
import { UserService } from '@/modules/user/user.service';

describe('UserBookEngagementService', () => {
  const user = new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    displayName: 'Reader',
    role: UserRole.READER,
    isPublisher: false,
  });
  let mockUserService: { getUserById: jest.Mock };
  let mockBookService: { getBookById: jest.Mock };
  let mockBookProcessingService: { listChaptersByBookIds: jest.Mock };
  let mockSessionTotals: { sumActiveDurationByBookForUser: jest.Mock };
  let mockChapters: { sumDurationsByChapterForUser: jest.Mock };
  let mockSpreads: { sumDurationsBySpreadForUser: jest.Mock };
  let userBookEngagementService: UserBookEngagementService;

  beforeEach(() => {
    mockUserService = { getUserById: jest.fn().mockResolvedValue(user) };
    mockBookService = { getBookById: jest.fn() };
    mockBookProcessingService = { listChaptersByBookIds: jest.fn().mockResolvedValue([]) };
    mockSessionTotals = { sumActiveDurationByBookForUser: jest.fn().mockResolvedValue([]) };
    mockChapters = { sumDurationsByChapterForUser: jest.fn().mockResolvedValue([]) };
    mockSpreads = { sumDurationsBySpreadForUser: jest.fn().mockResolvedValue([]) };
    userBookEngagementService = new UserBookEngagementService(
      mockUserService as unknown as UserService,
      mockBookService as unknown as BookService,
      mockBookProcessingService as unknown as BookProcessingService,
      mockSessionTotals as unknown as ReadingSessionTotalsService,
      mockChapters as unknown as ReadingChapterEngagementService,
      mockSpreads as unknown as ReadingVisualEngagementService,
    );
  });

  it('returns chapter rows for a reflowable book and an empty list when none exist', async () => {
    mockBookService.getBookById.mockResolvedValue(
      new BookEntity({
        id: 8,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        title: 'Story',
        description: 'A story',
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: BookType.STANDARD_CHAPTER,
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: new Date('2026-02-01T00:00:00.000Z'),
        ownerId: 4,
      }),
    );
    mockSessionTotals.sumActiveDurationByBookForUser.mockResolvedValue([
      { bookId: 8, activeDurationMs: 120000 },
    ]);
    mockChapters.sumDurationsByChapterForUser.mockResolvedValue([
      { spineIndex: 0, activeDurationMs: 120000 },
    ]);
    mockBookProcessingService.listChaptersByBookIds.mockResolvedValue([
      { bookId: 8, spineIndex: 0, title: 'Opening' },
    ]);
    const actualEngagement = await userBookEngagementService.getEngagement(5, 8);
    expect(actualEngagement.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEngagement.activeDurationMs).toBe(120000);
    expect(actualEngagement.chapters).toEqual([
      { spineIndex: 0, title: 'Opening', activeDurationMs: 120000 },
    ]);
    expect(actualEngagement.spreads).toEqual([]);
  });

  it('returns spread rows for a fixed-layout book', async () => {
    mockBookService.getBookById.mockResolvedValue(
      new BookEntity({
        id: 9,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        title: 'Picture',
        description: 'A picture book',
        layoutType: BookLayoutType.FIXED_LAYOUT,
        bookType: BookType.PICTURE_BOOK,
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: new Date('2026-02-01T00:00:00.000Z'),
        ownerId: 4,
      }),
    );
    mockSpreads.sumDurationsBySpreadForUser.mockResolvedValue([
      { spreadIndex: 0, pageNumber: 1, activeDurationMs: 40000, visualSceneTimeMs: 10000 },
    ]);
    const actualEngagement = await userBookEngagementService.getEngagement(5, 9);
    expect(actualEngagement.spreads[0].visualSceneTimeMs).toBe(10000);
    expect(actualEngagement.chapters).toEqual([]);
    expect(mockChapters.sumDurationsByChapterForUser).not.toHaveBeenCalled();
  });
});
