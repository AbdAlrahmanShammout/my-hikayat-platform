import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { AdminAnalyticsService } from '@/modules/monetization/admin-analytics.service';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { BookHeatmapService } from '@/modules/monetization/book-heatmap.service';
import { BookRevenueService } from '@/modules/monetization/book-revenue.service';
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

function createSamplePeriod(
  overrides: Partial<ConstructorParameters<typeof RevenuePeriodEntity>[0]> = {},
): RevenuePeriodEntity {
  return new RevenuePeriodEntity({
    id: 4,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2026-09-01T00:00:00.000Z'),
    status: RevenuePeriodStatus.OPEN,
    platformCutPercent: 30,
    poolAmountCents: 10000,
    ...overrides,
  });
}

function createSampleBook(): BookEntity {
  return new BookEntity({
    id: 10,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Revenue Picture Book',
    description: 'Used by admin analytics tests.',
    layoutType: BookLayoutType.FIXED_LAYOUT,
    bookType: BookType.PICTURE_BOOK,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId: 3,
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

describe('AdminAnalyticsService', () => {
  let mockRevenuePeriodService: { getRevenuePeriodById: jest.Mock };
  let mockBookRevenueService: {
    listBookRevenues: jest.Mock;
    sumAuthorCentsForPeriod: jest.Mock;
    calculatePeriodRevenue: jest.Mock;
  };
  let mockBookEngagementService: {
    listBookEngagements: jest.Mock;
    summarizeOwnerEngagementForPeriod: jest.Mock;
    aggregatePeriodEngagement: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockBookHeatmapService: { getBookHeatmap: jest.Mock };
  let adminAnalyticsService: AdminAnalyticsService;

  beforeEach(() => {
    mockRevenuePeriodService = { getRevenuePeriodById: jest.fn() };
    mockBookRevenueService = {
      listBookRevenues: jest.fn(),
      sumAuthorCentsForPeriod: jest.fn(),
      calculatePeriodRevenue: jest.fn(),
    };
    mockBookEngagementService = {
      listBookEngagements: jest.fn(),
      summarizeOwnerEngagementForPeriod: jest.fn(),
      aggregatePeriodEngagement: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockBookHeatmapService = { getBookHeatmap: jest.fn() };
    adminAnalyticsService = new AdminAnalyticsService(
      mockRevenuePeriodService as unknown as RevenuePeriodService,
      mockBookRevenueService as unknown as BookRevenueService,
      mockBookEngagementService as unknown as BookEngagementService,
      mockBookService as unknown as BookService,
      mockBookHeatmapService as unknown as BookHeatmapService,
    );
  });

  describe('listPeriodEarnings', () => {
    it('returns platform-wide author cents and the snapshotted platform cut', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookRevenueService.listBookRevenues.mockResolvedValue({
        entities: [createSampleRevenue()],
        total: 1,
      });
      mockBookRevenueService.sumAuthorCentsForPeriod.mockResolvedValue(7000);
      const actualResult = await adminAnalyticsService.listPeriodEarnings({
        revenuePeriodId: 4,
      });
      expect(mockBookRevenueService.sumAuthorCentsForPeriod).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        ownerId: undefined,
      });
      expect(actualResult.authorCents).toBe(7000);
      expect(actualResult.platformCutCents).toBe(3000);
    });

    it('leaves the platform cut null when the pool has not been set', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(
        createSamplePeriod({ poolAmountCents: null }),
      );
      mockBookRevenueService.listBookRevenues.mockResolvedValue({ entities: [], total: 0 });
      mockBookRevenueService.sumAuthorCentsForPeriod.mockResolvedValue(0);
      const actualResult = await adminAnalyticsService.listPeriodEarnings({
        revenuePeriodId: 4,
      });
      expect(actualResult.platformCutCents).toBeNull();
    });
  });

  describe('listPeriodAnalytics', () => {
    it('returns platform reading totals including minutes', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
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
      const actualResult = await adminAnalyticsService.listPeriodAnalytics({
        revenuePeriodId: 4,
      });
      expect(actualResult.totalReadingMinutes).toBe(5);
      expect(actualResult.totalWeightedEngagement).toBe(7);
    });
  });

  describe('getPeriodBookHeatmap', () => {
    it('returns the book heatmap for the period window', async () => {
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
      const actualHeatmap = await adminAnalyticsService.getPeriodBookHeatmap({
        revenuePeriodId: 4,
        bookId: 10,
      });
      expect(mockBookHeatmapService.getBookHeatmap).toHaveBeenCalledWith({
        book: createSampleBook(),
        period: createSamplePeriod(),
      });
      expect(actualHeatmap).toEqual(expectedHeatmap);
    });
  });

  describe('calculatePeriodRevenue', () => {
    it('calculates then returns the period earnings envelope', async () => {
      mockBookRevenueService.calculatePeriodRevenue.mockResolvedValue([]);
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookRevenueService.listBookRevenues.mockResolvedValue({
        entities: [createSampleRevenue()],
        total: 1,
      });
      mockBookRevenueService.sumAuthorCentsForPeriod.mockResolvedValue(7000);
      const actualResult = await adminAnalyticsService.calculatePeriodRevenue({
        revenuePeriodId: 4,
        actorUserId: 9,
      });
      expect(mockBookRevenueService.calculatePeriodRevenue).toHaveBeenCalledWith({
        revenuePeriodId: 4,
        actorUserId: 9,
      });
      expect(actualResult.authorCents).toBe(7000);
    });
  });

  describe('aggregatePeriodEngagement', () => {
    it('aggregates then returns the period analytics envelope', async () => {
      mockBookEngagementService.aggregatePeriodEngagement.mockResolvedValue([]);
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
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
      const actualResult = await adminAnalyticsService.aggregatePeriodEngagement({
        revenuePeriodId: 4,
      });
      expect(mockBookEngagementService.aggregatePeriodEngagement).toHaveBeenCalledWith({
        revenuePeriodId: 4,
      });
      expect(actualResult.totalReadingMinutes).toBe(5);
    });
  });
});
