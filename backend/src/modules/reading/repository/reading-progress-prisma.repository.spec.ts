import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingProgressMapper } from '@/modules/reading/mapper/reading-progress.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingProgressPrismaRepository } from './reading-progress-prisma.repository';

describe('ReadingProgressPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const lastSessionAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 3,
    createdAt,
    updatedAt,
    deletedAt: null,
    userId: 4,
    bookId: 8,
    layoutType: BookLayoutType.REFLOWABLE,
    spineIndex: 1,
    scrollOffset: 120,
    spreadIndex: null,
    pageNumber: null,
    lastSessionAt,
  };
  let mockPrismaProviderService: {
    readingProgress: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let readingProgressPrismaRepository: ReadingProgressPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      readingProgress: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    readingProgressPrismaRepository = new ReadingProgressPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates reading progress and maps the persistence payload', async () => {
    mockPrismaProviderService.readingProgress.create.mockResolvedValue(persistenceRow);
    const actualEntity = await readingProgressPrismaRepository.create({
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 1,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
      lastSessionAt,
    });
    expect(mockPrismaProviderService.readingProgress.create).toHaveBeenCalled();
    expect(actualEntity).toEqual(ReadingProgressMapper.toEntity(persistenceRow));
  });

  it('returns null when findByUserIdAndBookId misses progress', async () => {
    mockPrismaProviderService.readingProgress.findFirst.mockResolvedValue(null);
    const actualEntity = await readingProgressPrismaRepository.findByUserIdAndBookId(4, 8);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.readingProgress.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 4, bookId: 8, deletedAt: null },
      }),
    );
  });
});
