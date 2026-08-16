import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { AuthorAnalyticsService } from '@/modules/monetization/author-analytics.service';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookHeatmapService } from '@/modules/monetization/book-heatmap.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

function createSamplePeriod(): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 4,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    platformCutPercent: 30,
    poolAmountCents: 10000,
  });
}

function createSampleBook(ownerId = 3): BookEntity {
  return new BookEntity({
    id: 10,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Revenue Picture Book',
    description: 'Used by author analytics tests.',
    layoutType: BookLayoutType.FIXED_LAYOUT,
    bookType: BookType.PICTURE_BOOK,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId,
  });
}

function createSampleRevenue(): BookRevenueEntity {
  return new BookRevenueEntity({
    id: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    revenuePeriodId: 4,
    bookId: 8,
    ownerId: 3,
    weightedEngagement: 2.5,
    poolShareCents: 3571,
    platformCutCents: 1071,
    authorCents: 2500,
  });
}

function createSampleEngagement(): BookEngagementEntity {
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
  });
}

describe('AuthorAnalyticsService', () => {
  let mockBookRevenueService: {
    listBookRevenues: jest.Mock;
    sumAuthorCentsForPeriod: jest.Mock;
  };
  let mockBookEngagementService: {
    listBookEngagements: jest.Mock;
    summarizeOwnerEngagementForPeriod: jest.Mock;
  };
  let mockRevenuePeriodService: {
    listRevenuePeriods: jest.Mock;
    getRevenuePeriodById: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockBookHeatmapService: { getBookHeatmap: jest.Mock };
  let authorAnalyticsService: AuthorAnalyticsService;

  beforeEach(() => {
    mockBookRevenueService = {
      listBookRevenues: jest.fn(),
      sumAuthorCentsForPeriod: jest.fn(),
    };
    mockBookEngagementService = {
      listBookEngagements: jest.fn(),
      summarizeOwnerEngagementForPeriod: jest.fn(),
    };
    mockRevenuePeriodService = {
      listRevenuePeriods: jest.fn(),
      getRevenuePeriodById: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockBookHeatmapService = { getBookHeatmap: jest.fn() };
    authorAnalyticsService = new AuthorAnalyticsService(
      mockBookRevenueService as unknown as BookRevenueService,
      mockBookEngagementService as unknown as BookEngagementService,
      mockRevenuePeriodService as unknown as RevenuePeriodService,
      mockBookService as unknown as BookService,
      mockBookHeatmapService as unknown as BookHeatmapService,
    );
  });

  describe('listAuthorEarnings', () => {
    it('scopes book revenues and totals to the owner', async () => {
      mockBookRevenueService.listBookRevenues.mockResolvedValue({
        entities: [createSampleRevenue()],
        total: 1,
      });
      mockBookRevenueService.sumAuthorCentsForPeriod.mockResolvedValue(7000);
      const actualResult = await authorAnalyticsService.listAuthorEarnings({
        ownerId: 3,
        revenuePeriodId: 4,
        limit: 20,
        offset: 0,
      });
      expect(mockBookRevenueService.listBookRevenues).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        ownerId: 3,
        limit: 20,
        offset: 0,
      });
      expect(actualResult.authorCents).toBe(7000);
      expect(actualResult.page.entities[0].authorCents).toBe(2500);
    });
  });

  describe('listAuthorEarningsTrend', () => {
    it('sums owner cents for each listed revenue period', async () => {
      const period = createSamplePeriod();
      mockRevenuePeriodService.listRevenuePeriods.mockResolvedValue({
        entities: [period],
        total: 1,
      });
      mockBookRevenueService.sumAuthorCentsForPeriod.mockResolvedValue(7000);
      const actualPage = await authorAnalyticsService.listAuthorEarningsTrend({
        ownerId: 3,
        limit: 20,
        offset: 0,
      });
      expect(mockBookRevenueService.sumAuthorCentsForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        ownerId: 3,
      });
      expect(actualPage.entities[0].authorCents).toBe(7000);
      expect(actualPage.entities[0].period.id).toBe(4);
    });
  });

  describe('listAuthorAnalytics', () => {
    it('returns owner reading totals including minutes', async () => {
      mockBookEngagementService.listBookEngagements.mockResolvedValue({
        entities: [createSampleEngagement()],
        total: 1,
      });
      mockBookEngagementService.summarizeOwnerEngagementForPeriod.mockResolvedValue({
        totalActiveReadingMs: 120000,
        totalActiveSpreadMs: 180000,
        totalVisualSceneTimeMs: 90000,
        totalWeightedEngagement: 7,
      });
      const actualResult = await authorAnalyticsService.listAuthorAnalytics({
        ownerId: 3,
        revenuePeriodId: 4,
      });
      expect(actualResult.totalReadingMinutes).toBe(5);
      expect(actualResult.totalWeightedEngagement).toBe(7);
      expect(actualResult.page.entities[0].bookId).toBe(8);
    });
  });

  describe('getAuthorBookHeatmap', () => {
    it('returns the owned-book heatmap for the period window', async () => {
      const expectedHeatmap = {
        bookId: 10,
        revenuePeriodId: 4,
        layoutType: BookLayoutType.FIXED_LAYOUT,
        spreads: [
          { spreadIndex: 0, pageNumber: 1, activeDurationMs: 180000, visualSceneTimeMs: 90000 },
        ],
        chapters: [],
      };
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookHeatmapService.getBookHeatmap.mockResolvedValue(expectedHeatmap);
      const actualHeatmap = await authorAnalyticsService.getAuthorBookHeatmap({
        ownerId: 3,
        bookId: 10,
        revenuePeriodId: 4,
      });
      expect(mockBookHeatmapService.getBookHeatmap).toHaveBeenCalledWith({
        book: createSampleBook(),
        period: createSamplePeriod(),
      });
      expect(actualHeatmap).toEqual(expectedHeatmap);
    });

    it('hides another author book as not found', async () => {
      mockBookService.getBookById.mockResolvedValue(createSampleBook(9));
      await expect(
        authorAnalyticsService.getAuthorBookHeatmap({
          ownerId: 3,
          bookId: 10,
          revenuePeriodId: 4,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockBookHeatmapService.getBookHeatmap).not.toHaveBeenCalled();
    });
  });
});
