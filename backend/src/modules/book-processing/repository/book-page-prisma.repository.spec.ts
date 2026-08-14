import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';
import { BookPageMapper } from '@/modules/book-processing/mapper/book-page.mapper';
import { BookSpreadMapper } from '@/modules/book-processing/mapper/book-spread.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookPagePrismaRepository } from './book-page-prisma.repository';

describe('BookPagePrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const pageRow = {
    id: 21,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    spineIndex: 0,
    href: 'OEBPS/page1.xhtml',
    manifestId: 'p1',
    title: 'Cover',
    width: 1200,
    height: 1600,
    spreadRole: 'single',
  };
  const spreadRow = {
    id: 31,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    spreadIndex: 0,
    leftPageId: null,
    rightPageId: null,
    centerPageId: 21,
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookPage: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
    };
    bookSpread: {
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let bookPagePrismaRepository: BookPagePrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookPage: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
      bookSpread: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    bookPagePrismaRepository = new BookPagePrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('replaces pages and spreads for a book inside a repository transaction', async () => {
    mockPrismaProviderService.bookPage.create.mockResolvedValue(pageRow);
    mockPrismaProviderService.bookSpread.create.mockResolvedValue(spreadRow);
    mockPrismaProviderService.$transaction.mockImplementation(
      async (work: (client: typeof mockPrismaProviderService) => Promise<unknown>) => {
        return work(mockPrismaProviderService);
      },
    );
    const actualStructure = await bookPagePrismaRepository.replaceByBookId({
      bookId: 8,
      pages: [
        {
          spineIndex: 0,
          href: 'OEBPS/page1.xhtml',
          manifestId: 'p1',
          title: 'Cover',
          width: 1200,
          height: 1600,
          spreadRole: BookPageSpreadRole.SINGLE,
        },
      ],
      spreads: [
        {
          spreadIndex: 0,
          leftSpineIndex: null,
          rightSpineIndex: null,
          centerSpineIndex: 0,
        },
      ],
    });
    expect(mockPrismaProviderService.bookSpread.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 8 },
    });
    expect(mockPrismaProviderService.bookPage.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 8 },
    });
    expect(actualStructure.pages).toEqual([BookPageMapper.toEntity(pageRow)]);
    expect(actualStructure.spreads).toEqual([BookSpreadMapper.toEntity(spreadRow)]);
  });

  it('lists operational pages in spine order', async () => {
    mockPrismaProviderService.bookPage.findMany.mockResolvedValue([pageRow]);
    const actualPages = await bookPagePrismaRepository.listByBookId(8);
    expect(mockPrismaProviderService.bookPage.findMany).toHaveBeenCalledWith({
      where: { bookId: 8, deletedAt: null },
      orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
    });
    expect(actualPages).toEqual([BookPageMapper.toEntity(pageRow)]);
  });
});
