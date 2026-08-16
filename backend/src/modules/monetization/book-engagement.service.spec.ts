import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { ReadingIntelligenceService } from '@/modules/reading-intelligence/reading-intelligence.service';

import { BookEngagementService } from './book-engagement.service';

function createSamplePeriod(): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 4,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    platformCutPercent: 25,
    poolAmountCents: null,
  });
}

function createSampleBook(overrides: Partial<BookEntity> = {}): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Reflowable Sample',
    description: 'Used by engagement tests.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId: 3,
    categories: [
      new CategoryEntity({
        id: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        name: 'Fiction',
        slug: 'fiction',
        categoryWeight: 1.25,
      }),
    ],
    ...overrides,
  });
}

function createSampleEngagement(
  overrides: Partial<ConstructorParameters<typeof BookEngagementEntity>[0]> = {},
): BookEngagementEntity {
  return new BookEngagementEntity({
    id: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    revenuePeriodId: 4,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    activeReadingMs: 120000,
    activeSpreadMs: 0,
    visualSceneTimeMs: 0,
    categoryWeight: 1.25,
    weightedEngagement: 2.5,
    ...overrides,
  });
}

describe('BookEngagementService', () => {
  let mockBookEngagementRepository: {
    replaceForPeriod: jest.Mock;
    list: jest.Mock;
    listAllByPeriod: jest.Mock;
    findById: jest.Mock;
    findByPeriodAndBook: jest.Mock;
    summarizeByOwner: jest.Mock;
  };
  let mockRevenuePeriodService: { getRevenuePeriodById: jest.Mock };
  let mockReadingIntelligenceService: { listBookEngagementSignalsInRange: jest.Mock };
  let mockBookService: { getBookById: jest.Mock };
  let bookEngagementService: BookEngagementService;

  beforeEach(() => {
    mockBookEngagementRepository = {
      replaceForPeriod: jest.fn(),
      list: jest.fn(),
      listAllByPeriod: jest.fn(),
      findById: jest.fn(),
      findByPeriodAndBook: jest.fn(),
      summarizeByOwner: jest.fn(),
    };
    mockRevenuePeriodService = { getRevenuePeriodById: jest.fn() };
    mockReadingIntelligenceService = { listBookEngagementSignalsInRange: jest.fn() };
    mockBookService = { getBookById: jest.fn() };
    bookEngagementService = new BookEngagementService(
      mockBookEngagementRepository,
      mockRevenuePeriodService as unknown as RevenuePeriodService,
      mockReadingIntelligenceService as unknown as ReadingIntelligenceService,
      mockBookService as unknown as BookService,
    );
  });

  describe('aggregatePeriodEngagement', () => {
    it('weights reflowable active minutes by category weight and ignores idle time', async () => {
      const expectedEngagement = createSampleEngagement();
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockReadingIntelligenceService.listBookEngagementSignalsInRange.mockResolvedValue([
        {
          bookId: 8,
          layoutType: BookLayoutType.REFLOWABLE,
          activeDurationMs: 120000,
          visualSceneTimeMs: 0,
        },
      ]);
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockBookEngagementRepository.replaceForPeriod.mockResolvedValue([expectedEngagement]);
      const actualEntities = await bookEngagementService.aggregatePeriodEngagement({
        revenuePeriodId: 4,
      });
      expect(mockReadingIntelligenceService.listBookEngagementSignalsInRange).toHaveBeenCalledWith({
        startsAt: new Date('2026-08-01T00:00:00.000Z'),
        endsAt: new Date('2026-09-01T00:00:00.000Z'),
      });
      expect(mockBookEngagementRepository.replaceForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        rows: [
          {
            revenuePeriodId: 4,
            bookId: 8,
            layoutType: BookLayoutType.REFLOWABLE,
            activeReadingMs: 120000,
            activeSpreadMs: 0,
            visualSceneTimeMs: 0,
            categoryWeight: 1.25,
            weightedEngagement: 2.5,
          },
        ],
      });
      expect(actualEntities).toEqual([expectedEngagement]);
    });

    it('uses the arithmetic mean of assigned category weights', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockReadingIntelligenceService.listBookEngagementSignalsInRange.mockResolvedValue([
        {
          bookId: 8,
          layoutType: BookLayoutType.REFLOWABLE,
          activeDurationMs: 120000,
          visualSceneTimeMs: 0,
        },
      ]);
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook({
          categories: [
            new CategoryEntity({
              id: 2,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              name: 'Fiction',
              slug: 'fiction',
              categoryWeight: 1,
            }),
            new CategoryEntity({
              id: 3,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              name: 'History',
              slug: 'history',
              categoryWeight: 2,
            }),
          ],
        }),
      );
      mockBookEngagementRepository.replaceForPeriod.mockResolvedValue([]);
      await bookEngagementService.aggregatePeriodEngagement({ revenuePeriodId: 4 });
      expect(mockBookEngagementRepository.replaceForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        rows: [
          {
            revenuePeriodId: 4,
            bookId: 8,
            layoutType: BookLayoutType.REFLOWABLE,
            activeReadingMs: 120000,
            activeSpreadMs: 0,
            visualSceneTimeMs: 0,
            categoryWeight: 1.5,
            weightedEngagement: 3,
          },
        ],
      });
    });

    it('weights fixed-layout spread time and stores visual scene time separately', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockReadingIntelligenceService.listBookEngagementSignalsInRange.mockResolvedValue([
        {
          bookId: 10,
          layoutType: BookLayoutType.FIXED_LAYOUT,
          activeDurationMs: 180000,
          visualSceneTimeMs: 90000,
        },
      ]);
      mockBookService.getBookById.mockResolvedValue(
        createSampleBook({
          id: 10,
          layoutType: BookLayoutType.FIXED_LAYOUT,
          bookType: BookType.PICTURE_BOOK,
          categories: [
            new CategoryEntity({
              id: 3,
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              name: 'Picture Books',
              slug: 'picture-books',
              categoryWeight: 1.5,
            }),
          ],
        }),
      );
      mockBookEngagementRepository.replaceForPeriod.mockResolvedValue([]);
      await bookEngagementService.aggregatePeriodEngagement({ revenuePeriodId: 4 });
      expect(mockBookEngagementRepository.replaceForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        rows: [
          {
            revenuePeriodId: 4,
            bookId: 10,
            layoutType: BookLayoutType.FIXED_LAYOUT,
            activeReadingMs: 0,
            activeSpreadMs: 180000,
            visualSceneTimeMs: 90000,
            categoryWeight: 1.5,
            weightedEngagement: 4.5,
          },
        ],
      });
    });

    it('skips a book whose layout type is unknown', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockReadingIntelligenceService.listBookEngagementSignalsInRange.mockResolvedValue([
        {
          bookId: 8,
          layoutType: BookLayoutType.REFLOWABLE,
          activeDurationMs: 120000,
          visualSceneTimeMs: 0,
        },
      ]);
      mockBookService.getBookById.mockResolvedValue(createSampleBook({ layoutType: null }));
      mockBookEngagementRepository.replaceForPeriod.mockResolvedValue([]);
      await bookEngagementService.aggregatePeriodEngagement({ revenuePeriodId: 4 });
      expect(mockBookEngagementRepository.replaceForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        rows: [],
      });
    });
  });

  describe('listAllBookEngagementsForPeriod', () => {
    it('returns every engagement row after confirming the period exists', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookEngagementRepository.listAllByPeriod.mockResolvedValue([createSampleEngagement()]);
      const actualEntities = await bookEngagementService.listAllBookEngagementsForPeriod(4);
      expect(mockBookEngagementRepository.listAllByPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
      });
      expect(actualEntities).toEqual([createSampleEngagement()]);
    });
  });

  describe('listBookEngagements', () => {
    it('lists with default pagination after confirming the period exists', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookEngagementRepository.list.mockResolvedValue({
        entities: [createSampleEngagement()],
        total: 1,
      });
      const actualPage = await bookEngagementService.listBookEngagements({ revenuePeriodId: 4 });
      expect(mockBookEngagementRepository.list).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        ownerId: undefined,
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('summarizeOwnerEngagementForPeriod', () => {
    it('returns owner totals after confirming the period exists', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookEngagementRepository.summarizeByOwner.mockResolvedValue({
        totalActiveReadingMs: 120000,
        totalActiveSpreadMs: 180000,
        totalVisualSceneTimeMs: 90000,
        totalWeightedEngagement: 7,
      });
      const actualSummary = await bookEngagementService.summarizeOwnerEngagementForPeriod({
        revenuePeriodId: 4,
        ownerId: 3,
      });
      expect(mockBookEngagementRepository.summarizeByOwner).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        ownerId: 3,
      });
      expect(actualSummary.totalWeightedEngagement).toBe(7);
    });
  });

  describe('getBookEngagementById', () => {
    it('throws when the engagement row is missing', async () => {
      mockBookEngagementRepository.findById.mockResolvedValue(null);
      await expect(bookEngagementService.getBookEngagementById(1)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });
});
