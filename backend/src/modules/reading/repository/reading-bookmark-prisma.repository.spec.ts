import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { ReadingBookmarkMapper } from '@/modules/reading/mapper/reading-bookmark.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { ReadingBookmarkPrismaRepository } from './reading-bookmark-prisma.repository';

describe('ReadingBookmarkPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 5,
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
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    readingBookmark: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let readingBookmarkPrismaRepository: ReadingBookmarkPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      readingBookmark: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    readingBookmarkPrismaRepository = new ReadingBookmarkPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a bookmark and maps the persistence payload', async () => {
    mockPrismaProviderService.readingBookmark.create.mockResolvedValue(persistenceRow);
    const actualEntity = await readingBookmarkPrismaRepository.create({
      userId: 4,
      bookId: 8,
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 1,
      scrollOffset: 120,
      spreadIndex: null,
      pageNumber: null,
    });
    expect(mockPrismaProviderService.readingBookmark.create).toHaveBeenCalled();
    expect(actualEntity).toEqual(ReadingBookmarkMapper.toEntity(persistenceRow));
  });

  it('returns a page with a real total', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 2]);
    const actualPage = await readingBookmarkPrismaRepository.list({
      userId: 4,
      bookId: 8,
      limit: 20,
      offset: 0,
    });
    expect(actualPage.total).toBe(2);
    expect(actualPage.entities).toHaveLength(1);
    expect(actualPage.entities[0].id).toBe(5);
  });

  it('returns null when findById misses a bookmark', async () => {
    mockPrismaProviderService.readingBookmark.findFirst.mockResolvedValue(null);
    const actualEntity = await readingBookmarkPrismaRepository.findById(5);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.readingBookmark.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5, deletedAt: null },
      }),
    );
  });
});
