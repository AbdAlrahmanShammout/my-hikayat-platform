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
import { BookEngagementEntity } from '@/modules/monetization/entity/book-engagement.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodPoolAmountMissingException } from '@/modules/monetization/exceptions/revenue-period-pool-amount-missing.exception';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';

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
    platformCutPercent: 30,
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

function createSampleEngagement(
  overrides: Partial<ConstructorParameters<typeof BookEngagementEntity>[0]>,
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
    categoryWeight: 1,
    weightedEngagement: 2.5,
    ...overrides,
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
  let mockRevenuePeriodService: { getRevenuePeriodById: jest.Mock };
  let mockBookEngagementService: {
    aggregatePeriodEngagement: jest.Mock;
    listAllBookEngagementsForPeriod: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let bookRevenueService: BookRevenueService;

  beforeEach(() => {
    mockBookRevenueRepository = {
      replaceForPeriod: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      findByPeriodAndBook: jest.fn(),
      sumAuthorCents: jest.fn(),
    };
    mockRevenuePeriodService = { getRevenuePeriodById: jest.fn() };
    mockBookEngagementService = {
      aggregatePeriodEngagement: jest.fn(),
      listAllBookEngagementsForPeriod: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    bookRevenueService = new BookRevenueService(
      mockBookRevenueRepository,
      mockRevenuePeriodService as unknown as RevenuePeriodService,
      mockBookEngagementService as unknown as BookEngagementService,
      mockBookService as unknown as BookService,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  describe('calculatePeriodRevenue', () => {
    it('splits the pool by weighted engagement after the snapshotted platform cut', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(createSamplePeriod());
      mockBookEngagementService.aggregatePeriodEngagement.mockResolvedValue([]);
      mockBookEngagementService.listAllBookEngagementsForPeriod.mockResolvedValue([
        createSampleEngagement({ id: 1, bookId: 8, weightedEngagement: 2.5 }),
        createSampleEngagement({
          id: 2,
          bookId: 10,
          weightedEngagement: 4.5,
          activeReadingMs: 0,
          activeSpreadMs: 180000,
          layoutType: BookLayoutType.FIXED_LAYOUT,
        }),
      ]);
      mockBookService.getBookById.mockImplementation((id: number) => {
        if (id === 8) {
          return Promise.resolve(createSampleBook(8, 3));
        }
        return Promise.resolve(createSampleBook(10, 5));
      });
      mockBookRevenueRepository.replaceForPeriod.mockResolvedValue([]);
      await bookRevenueService.calculatePeriodRevenue({ revenuePeriodId: 4, actorUserId });
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
              weightedEngagement: 2.5,
              authorCents: 2500,
              platformCutCents: 1071,
              poolShareCents: 3571,
            },
            {
              revenuePeriodId: 4,
              bookId: 10,
              ownerId: 5,
              weightedEngagement: 4.5,
              authorCents: 4500,
              platformCutCents: 1929,
              poolShareCents: 6429,
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
            platformCutPercent: 30,
            bookCount: 2,
          },
        },
        undefined,
      );
    });

    it('rejects a period whose pool amount has not been set', async () => {
      mockRevenuePeriodService.getRevenuePeriodById.mockResolvedValue(
        createSamplePeriod({ poolAmountCents: null }),
      );
      await expect(
        bookRevenueService.calculatePeriodRevenue({ revenuePeriodId: 4, actorUserId }),
      ).rejects.toBeInstanceOf(RevenuePeriodPoolAmountMissingException);
      expect(mockBookEngagementService.aggregatePeriodEngagement).not.toHaveBeenCalled();
      expect(mockBookRevenueRepository.replaceForPeriod).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
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
