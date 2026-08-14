import { BookPageTextRunMapper } from '@/modules/book-processing/mapper/book-page-text-run.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookPageTextRunPrismaRepository } from './book-page-text-run-prisma.repository';

describe('BookPageTextRunPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 41,
    createdAt,
    updatedAt,
    deletedAt: null,
    textLayerId: 51,
    sortOrder: 0,
    text: 'Harbor',
    x: 120,
    y: 80,
    width: 200,
    height: 24,
  };
  let mockPrismaProviderService: {
    bookPageTextRun: { findMany: jest.Mock };
  };
  let bookPageTextRunPrismaRepository: BookPageTextRunPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      bookPageTextRun: { findMany: jest.fn() },
    };
    bookPageTextRunPrismaRepository = new BookPageTextRunPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('lists operational text runs in sort order', async () => {
    mockPrismaProviderService.bookPageTextRun.findMany.mockResolvedValue([persistenceRow]);
    const actualRuns = await bookPageTextRunPrismaRepository.listByTextLayerId(51);
    expect(mockPrismaProviderService.bookPageTextRun.findMany).toHaveBeenCalledWith({
      where: { textLayerId: 51, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    expect(actualRuns).toEqual([BookPageTextRunMapper.toEntity(persistenceRow)]);
  });
});
