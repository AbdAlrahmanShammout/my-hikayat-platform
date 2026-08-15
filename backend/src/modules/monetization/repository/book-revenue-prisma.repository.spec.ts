import { BookRevenueMapper } from '@/modules/monetization/mapper/book-revenue.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookRevenuePrismaRepository } from './book-revenue-prisma.repository';

describe('BookRevenuePrismaRepository', () => {
  const createdAt = new Date('2026-08-01T00:00:00.000Z');
  const persistenceRow = {
    id: 1,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    revenuePeriodId: 4,
    bookId: 8,
    ownerId: 3,
    weightedEngagement: 2.5,
    poolShareCents: 3571,
    platformCutCents: 1071,
    authorCents: 2500,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookRevenue: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      upsert: jest.Mock;
      updateMany: jest.Mock;
      aggregate: jest.Mock;
    };
  };
  let bookRevenuePrismaRepository: BookRevenuePrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookRevenue: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
        updateMany: jest.fn(),
        aggregate: jest.fn(),
      },
    };
    bookRevenuePrismaRepository = new BookRevenuePrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('lists book revenues ordered by author cents descending', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await bookRevenuePrismaRepository.list({
      revenuePeriodId: 4,
      ownerId: 3,
      limit: 20,
      offset: 0,
    });
    expect(mockPrismaProviderService.bookRevenue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { revenuePeriodId: 4, deletedAt: null, ownerId: 3 },
        orderBy: [{ authorCents: 'desc' }, { bookId: 'asc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([BookRevenueMapper.toEntity(persistenceRow)]);
  });

  it('sums author cents for an owner in a period', async () => {
    mockPrismaProviderService.bookRevenue.aggregate.mockResolvedValue({
      _sum: { authorCents: 2500 },
    });
    const actualTotal = await bookRevenuePrismaRepository.sumAuthorCents({
      revenuePeriodId: 4,
      ownerId: 3,
    });
    expect(actualTotal).toBe(2500);
  });

  it('sums author cents for every owner in a period', async () => {
    mockPrismaProviderService.bookRevenue.aggregate.mockResolvedValue({
      _sum: { authorCents: 7000 },
    });
    const actualTotal = await bookRevenuePrismaRepository.sumAuthorCents({
      revenuePeriodId: 4,
    });
    expect(mockPrismaProviderService.bookRevenue.aggregate).toHaveBeenCalledWith({
      where: { revenuePeriodId: 4, deletedAt: null },
      _sum: { authorCents: true },
    });
    expect(actualTotal).toBe(7000);
  });
});
