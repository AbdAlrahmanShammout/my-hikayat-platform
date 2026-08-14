import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { BookMapper } from '@/modules/book/mapper/book.mapper';
import { bookDetailsInclude } from '@/modules/book/types/book-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { BookPrismaRepository } from './book-prisma.repository';

describe('BookPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 8,
    createdAt,
    updatedAt,
    deletedAt: null,
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: 'reflowable',
    bookType: 'standard_chapter',
    publishingStatus: 'pending',
    publishedAt: null,
    ownerId: 4,
    owner: {
      id: 4,
      createdAt,
      updatedAt,
      deletedAt: null,
      email: 'author@example.com',
      passwordHash: 'hashed-password',
      role: 'author',
      isPublisher: true,
    },
    categories: [],
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    book: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let bookPrismaRepository: BookPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      book: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    bookPrismaRepository = new BookPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a book with an owner and categories and maps the persistence payload', async () => {
    mockPrismaProviderService.book.create.mockResolvedValue(persistenceRow);
    const actualEntity = await bookPrismaRepository.create({
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.PENDING,
      ownerId: 4,
      categoryIds: [2],
    });
    expect(mockPrismaProviderService.book.create).toHaveBeenCalledWith(
      expect.objectContaining({
        include: bookDetailsInclude,
        data: expect.objectContaining({
          title: 'The Last Lighthouse',
          bookType: BookType.STANDARD_CHAPTER,
          publishingStatus: BookPublishingStatus.PENDING,
          owner: { connect: { id: 4 } },
          categories: { connect: [{ id: 2 }] },
        }),
      }),
    );
    expect(actualEntity).toEqual(BookMapper.toEntity(persistenceRow));
  });

  it('returns null when findById misses an operational book', async () => {
    mockPrismaProviderService.book.findFirst.mockResolvedValue(null);
    const actualEntity = await bookPrismaRepository.findById(8);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.book.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 8, deletedAt: null },
        include: bookDetailsInclude,
      }),
    );
  });

  it('lists books with a real total and optional owner filter', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await bookPrismaRepository.list({ limit: 20, offset: 0, ownerId: 4 });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, ownerId: 4 },
        include: bookDetailsInclude,
      }),
    );
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([BookMapper.toEntity(persistenceRow)]);
  });
});
