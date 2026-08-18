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
      aggregate: jest.Mock;
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
        aggregate: jest.fn(),
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

  it('filters listed engagements by book owner', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    await bookEngagementPrismaRepository.list({
      revenuePeriodId: 4,
      ownerId: 3,
      limit: 20,
      offset: 0,
    });
    expect(mockPrismaProviderService.bookEngagement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          revenuePeriodId: 4,
          deletedAt: null,
          book: { ownerId: 3, deletedAt: null },
        },
        orderBy: [{ weightedEngagement: 'desc' }, { bookId: 'asc' }],
      }),
    );
  });

  it('summarizes owner engagement totals for a period', async () => {
    mockPrismaProviderService.bookEngagement.aggregate.mockResolvedValue({
      _sum: {
        activeReadingMs: 120000,
        activeSpreadMs: 180000,
        visualSceneTimeMs: 90000,
        weightedEngagement: 7,
      },
    });
    const actualSummary = await bookEngagementPrismaRepository.summarizeByOwner({
      revenuePeriodId: 4,
      ownerId: 3,
    });
    expect(actualSummary).toEqual({
      totalActiveReadingMs: 120000,
      totalActiveSpreadMs: 180000,
      totalVisualSceneTimeMs: 90000,
      totalWeightedEngagement: 7,
    });
  });

  it('summarizes engagement totals for every owner in a period', async () => {
    mockPrismaProviderService.bookEngagement.aggregate.mockResolvedValue({
      _sum: {
        activeReadingMs: 120000,
        activeSpreadMs: 180000,
        visualSceneTimeMs: 90000,
        weightedEngagement: 7,
      },
    });
    const actualSummary = await bookEngagementPrismaRepository.summarizeByOwner({
      revenuePeriodId: 4,
    });
    expect(mockPrismaProviderService.bookEngagement.aggregate).toHaveBeenCalledWith({
      where: { revenuePeriodId: 4, deletedAt: null, book: { deletedAt: null } },
      _sum: {
        activeReadingMs: true,
        activeSpreadMs: true,
        visualSceneTimeMs: true,
        weightedEngagement: true,
      },
    });
    expect(actualSummary.totalWeightedEngagement).toBe(7);
  });

  it('summarizes engagement totals across every period when no period is provided', async () => {
    mockPrismaProviderService.bookEngagement.aggregate.mockResolvedValue({
      _sum: {
        activeReadingMs: 90000,
        activeSpreadMs: 0,
        visualSceneTimeMs: 45000,
        weightedEngagement: 1.5,
      },
    });
    const actualSummary = await bookEngagementPrismaRepository.summarizeByOwner({
      ownerId: 3,
    });
    expect(mockPrismaProviderService.bookEngagement.aggregate).toHaveBeenCalledWith({
      where: { deletedAt: null, book: { deletedAt: null, ownerId: 3 } },
      _sum: {
        activeReadingMs: true,
        activeSpreadMs: true,
        visualSceneTimeMs: true,
        weightedEngagement: true,
      },
    });
    expect(actualSummary.totalActiveReadingMs).toBe(90000);
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
        where: { revenuePeriodId: 4, deletedAt: null, book: { deletedAt: null } },
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
