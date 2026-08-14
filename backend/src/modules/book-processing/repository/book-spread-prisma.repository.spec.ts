import { BookSpreadMapper } from '@/modules/book-processing/mapper/book-spread.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookSpreadPrismaRepository } from './book-spread-prisma.repository';

describe('BookSpreadPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 31,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    spreadIndex: 0,
    leftPageId: 21,
    rightPageId: 22,
    centerPageId: null,
  };
  let mockPrismaProviderService: {
    bookSpread: { findMany: jest.Mock };
  };
  let bookSpreadPrismaRepository: BookSpreadPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      bookSpread: { findMany: jest.fn() },
    };
    bookSpreadPrismaRepository = new BookSpreadPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('lists operational spreads in reading order', async () => {
    mockPrismaProviderService.bookSpread.findMany.mockResolvedValue([persistenceRow]);
    const actualSpreads = await bookSpreadPrismaRepository.listByBookId(8);
    expect(mockPrismaProviderService.bookSpread.findMany).toHaveBeenCalledWith({
      where: { bookId: 8, deletedAt: null },
      orderBy: [{ spreadIndex: 'asc' }, { id: 'asc' }],
    });
    expect(actualSpreads).toEqual([BookSpreadMapper.toEntity(persistenceRow)]);
  });
});
