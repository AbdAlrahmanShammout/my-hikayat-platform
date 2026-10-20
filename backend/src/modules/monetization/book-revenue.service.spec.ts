import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookEngagementService } from '@/modules/monetization/book-engagement.service';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { BookReadingCycleService } from '@/modules/reading-completion/book-reading-cycle.service';
import { StripeManagerService } from '@/providers/stripe/stripe-manager.service';

import { BookRevenueService } from './book-revenue.service';

const actorUserId = 9;

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
    poolAmountCents: 10000,
    ...overrides,
  });
}

function createSampleBook(id: number, ownerId: number): BookEntity {
  return new BookEntity({
    id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: `Book ${id}`,
    description: 'Used by revenue tests.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    ownerId,
  });
}

describe('BookRevenueService', () => {
  let mockBookRevenueRepository: {
    replaceForPeriod: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    findByPeriodAndBook: jest.Mock;
    sumAuthorCents: jest.Mock;
  };
  let mockRevenuePeriodService: {
    getRevenuePeriodById: jest.Mock;
    updateRevenuePeriod: jest.Mock;
  };
  let mockBookEngagementService: {
    aggregatePeriodEngagement: jest.Mock;
    listAllBookEngagementsForPeriod: jest.Mock;
  };
  let mockBookReadingCycleService: { listCompletedReadCounts: jest.Mock };
  let mockBookService: { getBookById: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let mockStripeManagerService: { summarizeSubscriptionNetCents: jest.Mock };
  let bookRevenueService: BookRevenueService;

  beforeEach(() => {
    mockBookRevenueRepository = {
      replaceForPeriod: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      findByPeriodAndBook: jest.fn(),
      sumAuthorCents: jest.fn(),
    };
    mockRevenuePeriodService = {
      getRevenuePeriodById: jest.fn(),
      updateRevenuePeriod: jest.fn(),
    };
    mockStripeManagerService = { summarizeSubscriptionNetCents: jest.fn() };
    mockBookEngagementService = {
      aggregatePeriodEngagement: jest.fn(),
      listAllBookEngagementsForPeriod: jest.fn(),
    };
    mockBookReadingCycleService = { listCompletedReadCounts: jest.fn() };
    mockBookService = { getBookById: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    bookRevenueService = new BookRevenueService(
      mockBookRevenueRepository,
      mockRevenuePeriodService as unknown as RevenuePeriodService,
      mockBookEngagementService as unknown as BookEngagementService,
      mockBookReadingCycleService as unknown as BookReadingCycleService,
      mockBookService as unknown as BookService,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
      mockStripeManagerService as unknown as StripeManagerService,
    );
  });

  describe('calculatePeriodRevenue', () => {
    it('splits the pool by completed reads with a 40 percent publisher share', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockStripeManagerService.summarizeSubscriptionNetCents.mockResolvedValue(10000);
      mockRevenuePeriodService.updateRevenuePeriod.mockResolvedValue(createSamplePeriod());
      mockBookEngagementService.aggregatePeriodEngagement.mockResolvedValue([]);
      mockBookReadingCycleService.listCompletedReadCounts.mockResolvedValue([
        { bookId: 8, completedReadCount: 1 },
        { bookId: 10, completedReadCount: 3 },
      ]);
      mockBookService.getBookById.mockImplementation((id: number) => {
        if (id === 8) {
          return Promise.resolve(createSampleBook(8, 3));
        }
        return Promise.resolve(createSampleBook(10, 5));
      });
      mockBookRevenueRepository.replaceForPeriod.mockResolvedValue([]);
      await bookRevenueService.calculatePeriodRevenue({
        revenuePeriodId: 4,
        actorUserId,
        calculatedAt: new Date('2026-10-20T00:00:00.000Z'),
      });
      expect(mockBookEngagementService.aggregatePeriodEngagement).toHaveBeenCalledWith({
        revenuePeriodId: 4,
      });
      expect(mockBookRevenueRepository.replaceForPeriod).toHaveBeenCalledWith(
        {
          revenuePeriodId: 4,
          rows: [
            {
              revenuePeriodId: 4,
              bookId: 8,
              ownerId: 3,
              completedReadCount: 1,
              authorCents: 1000,
              platformCutCents: 1500,
              poolShareCents: 2500,
            },
            {
              revenuePeriodId: 4,
              bookId: 10,
              ownerId: 5,
              completedReadCount: 3,
              authorCents: 3000,
              platformCutCents: 4500,
              poolShareCents: 7500,
            },
          ],
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.REVENUE_CALCULATED,
          subjectType: AuditSubjectType.REVENUE_PERIOD,
          subjectId: 4,
          metadata: {
            poolAmountCents: 10000,
            poolSource: 'stripe',
            publishersSharePercent: 40,
            bookCount: 2,
          },
        },
        undefined,
      );
    });

    it('stores a zero pool when Stripe reports no subscription net', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(
        createSamplePeriod({ poolAmountCents: null }),
      );
      mockStripeManagerService.summarizeSubscriptionNetCents.mockResolvedValue(null);
      mockRevenuePeriodService.updateRevenuePeriod.mockResolvedValue(
        createSamplePeriod({ poolAmountCents: 0 }),
      );
      mockBookEngagementService.aggregatePeriodEngagement.mockResolvedValue([]);
      mockBookReadingCycleService.listCompletedReadCounts.mockResolvedValue([]);
      mockBookRevenueRepository.replaceForPeriod.mockResolvedValue([]);
      await bookRevenueService.calculatePeriodRevenue({
        revenuePeriodId: 4,
        actorUserId,
        calculatedAt: new Date('2026-10-20T00:00:00.000Z'),
      });
      expect(mockRevenuePeriodService.updateRevenuePeriod).toHaveBeenCalledWith({
        id: 4,
        poolAmountCents: 0,
      });
      expect(mockBookRevenueRepository.replaceForPeriod).toHaveBeenCalledWith(
        { revenuePeriodId: 4, rows: [] },
        undefined,
      );
    });
  });

  describe('getBookRevenueById', () => {
    it('throws when the revenue row is missing', async () => {
      mockBookRevenueRepository.findById.mockResolvedValue(null);
      await expect(bookRevenueService.getBookRevenueById(1)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('sumAuthorCentsForPeriod', () => {
    it('sums persisted author cents for an owner', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookRevenueRepository.sumAuthorCents.mockResolvedValue(2500);
      const actualTotal = await bookRevenueService.sumAuthorCentsForPeriod({
        revenuePeriodId: 4,
        ownerId: 3,
      });
      expect(actualTotal).toBe(2500);
    });
  });

  describe('sumAuthorCents', () => {
    it('sums persisted author cents across every period without a period lookup', async () => {
      mockBookRevenueRepository.sumAuthorCents.mockResolvedValue(7000);
      const actualTotal = await bookRevenueService.sumAuthorCents({ ownerId: 3 });
      expect(mockRevenuePeriodService.getRevenuePeriodById).not.toHaveBeenCalled();
      expect(mockBookRevenueRepository.sumAuthorCents).toHaveBeenCalledWith({
        revenuePeriodId: undefined,
        ownerId: 3,
      });
      expect(actualTotal).toBe(7000);
    });
  });
});
