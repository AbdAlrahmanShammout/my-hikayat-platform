import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { BookEngagementMapper } from '@/modules/monetization/mapper/book-engagement.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookEngagementPrismaRepository } from './book-engagement-prisma.repository';

describe('BookEngagementPrismaRepository', () => {
  const createdAt = new Date('2026-08-01T00:00:00.000Z');
  const persistenceRow = {
    id: 1,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    revenuePeriodId: 4,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    activeReadingMs: 120000,
    activeSpreadMs: 0,
    visualSceneTimeMs: 0,
    categoryWeight: 1.25,
    weightedEngagement: 2.5,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookEngagement: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let bookEngagementPrismaRepository: BookEngagementPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookEngagement: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    bookEngagementPrismaRepository = new BookEngagementPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('lists every engagement row for a period without pagination', async () => {
    mockPrismaProviderService.bookEngagement.findMany.mockResolvedValue([persistenceRow]);
    const actualEntities = await bookEngagementPrismaRepository.listAllByPeriod({
      revenuePeriodId: 4,
    });
    expect(mockPrismaProviderService.bookEngagement.findMany).toHaveBeenCalledWith({
      where: { revenuePeriodId: 4, deletedAt: null },
      orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
    });
    expect(actualEntities).toEqual([BookEngagementMapper.toEntity(persistenceRow)]);
  });

  it('lists book engagements ordered by weighted engagement descending', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await bookEngagementPrismaRepository.list({
      revenuePeriodId: 4,
      limit: 20,
      offset: 0,
    });
    expect(mockPrismaProviderService.bookEngagement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { revenuePeriodId: 4, deletedAt: null },
        orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([BookEngagementMapper.toEntity(persistenceRow)]);
  });

  it('replaces period rows inside a transaction', async () => {
    mockPrismaProviderService.$transaction.mockImplementation(
      (work: (client: unknown) => Promise<unknown>) => work(mockPrismaProviderService),
    );
    mockPrismaProviderService.bookEngagement.findMany.mockResolvedValue([persistenceRow]);
    const actualEntities = await bookEngagementPrismaRepository.replaceForPeriod({
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
    expect(mockPrismaProviderService.bookEngagement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { revenuePeriodId_bookId: { revenuePeriodId: 4, bookId: 8 } },
      }),
    );
    expect(mockPrismaProviderService.bookEngagement.updateMany).toHaveBeenCalledWith({
      where: {
        revenuePeriodId: 4,
        deletedAt: null,
        bookId: { notIn: [8] },
      },
      data: { deletedAt: expect.any(Date) },
    });
    expect(actualEntities).toEqual([BookEngagementMapper.toEntity(persistenceRow)]);
  });
});
