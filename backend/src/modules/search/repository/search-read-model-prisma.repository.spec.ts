import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { SearchReadModelPrismaRepository } from './search-read-model-prisma.repository';

describe('SearchReadModelPrismaRepository', () => {
  let mockPrismaProviderService: {
    bookChapter: { findMany: jest.Mock; count: jest.Mock };
    bookPageTextLayer: { findMany: jest.Mock; count: jest.Mock };
  };
  let searchReadModelPrismaRepository: SearchReadModelPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      bookChapter: { findMany: jest.fn(), count: jest.fn() },
      bookPageTextLayer: { findMany: jest.fn(), count: jest.fn() },
    };
    searchReadModelPrismaRepository = new SearchReadModelPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('searches reflowable chapter text', async () => {
    mockPrismaProviderService.bookChapter.findMany.mockResolvedValue([
      { spineIndex: 0, title: 'Dawn Watch', contentText: 'The Harbor lights' },
    ]);
    mockPrismaProviderService.bookChapter.count.mockResolvedValue(1);
    const actualPage = await searchReadModelPrismaRepository.searchInBook({
      bookId: 8,
      query: 'Harbor',
      limit: 20,
      offset: 0,
      layoutType: BookLayoutType.REFLOWABLE,
    });
    expect(mockPrismaProviderService.bookChapter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bookId: 8,
          deletedAt: null,
          contentText: { contains: 'Harbor', mode: 'insensitive' },
        },
        orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.hits[0]).toEqual({
      layoutType: BookLayoutType.REFLOWABLE,
      spineIndex: 0,
      pageNumber: null,
      spreadIndex: null,
      title: 'Dawn Watch',
      contentText: 'The Harbor lights',
      runs: [],
    });
  });

  it('searches fixed-layout text layers with page locators and runs', async () => {
    mockPrismaProviderService.bookPageTextLayer.findMany.mockResolvedValue([
      {
        contentText: 'Harbor lights',
        page: {
          spineIndex: 0,
          title: 'Left Page',
          leftSpreads: [{ spreadIndex: 0 }],
          rightSpreads: [],
          centerSpreads: [],
        },
        runs: [{ text: 'Harbor', x: 120, y: 80, width: 80, height: 20 }],
      },
    ]);
    mockPrismaProviderService.bookPageTextLayer.count.mockResolvedValue(1);
    const actualPage = await searchReadModelPrismaRepository.searchInBook({
      bookId: 8,
      query: 'Harbor',
      limit: 20,
      offset: 0,
      layoutType: BookLayoutType.FIXED_LAYOUT,
    });
    expect(mockPrismaProviderService.bookPageTextLayer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          bookId: 8,
          deletedAt: null,
          contentText: { contains: 'Harbor', mode: 'insensitive' },
          page: { is: { deletedAt: null } },
        },
      }),
    );
    expect(actualPage.hits[0]).toEqual({
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spineIndex: 0,
      pageNumber: 1,
      spreadIndex: 0,
      title: 'Left Page',
      contentText: 'Harbor lights',
      runs: [{ text: 'Harbor', x: 120, y: 80, width: 80, height: 20 }],
    });
  });
});
