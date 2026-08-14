import { BookChapterMapper } from '@/modules/book-processing/mapper/book-chapter.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookChapterPrismaRepository } from './book-chapter-prisma.repository';

describe('BookChapterPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 11,
    createdAt,
    updatedAt,
    deletedAt: null,
    bookId: 8,
    spineIndex: 0,
    href: 'OEBPS/chapter1.xhtml',
    manifestId: 'c1',
    title: 'The Harbor',
    contentText: 'First chapter text.',
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    bookChapter: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let bookChapterPrismaRepository: BookChapterPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      bookChapter: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
      },
    };
    bookChapterPrismaRepository = new BookChapterPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('replaces chapters for a book inside a repository transaction', async () => {
    mockPrismaProviderService.bookChapter.create.mockResolvedValue(persistenceRow);
    mockPrismaProviderService.$transaction.mockImplementation(
      async (work: (client: typeof mockPrismaProviderService) => Promise<unknown>) => {
        return work(mockPrismaProviderService);
      },
    );
    const actualEntities = await bookChapterPrismaRepository.replaceByBookId({
      bookId: 8,
      chapters: [
        {
          spineIndex: 0,
          href: 'OEBPS/chapter1.xhtml',
          manifestId: 'c1',
          title: 'The Harbor',
          contentText: 'First chapter text.',
        },
      ],
    });
    expect(mockPrismaProviderService.bookChapter.deleteMany).toHaveBeenCalledWith({
      where: { bookId: 8 },
    });
    expect(mockPrismaProviderService.bookChapter.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          book: { connect: { id: 8 } },
          title: 'The Harbor',
          spineIndex: 0,
        }),
      }),
    );
    expect(actualEntities).toEqual([BookChapterMapper.toEntity(persistenceRow)]);
  });

  it('lists operational chapters in spine order', async () => {
    mockPrismaProviderService.bookChapter.findMany.mockResolvedValue([persistenceRow]);
    const actualEntities = await bookChapterPrismaRepository.listByBookId(8);
    expect(mockPrismaProviderService.bookChapter.findMany).toHaveBeenCalledWith({
      where: { bookId: 8, deletedAt: null },
      orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
    });
    expect(actualEntities).toEqual([BookChapterMapper.toEntity(persistenceRow)]);
  });
});
