import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
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
    processingStatus: 'not_started',
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
      processingStatus: BookProcessingStatus.NOT_STARTED,
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
          processingStatus: BookProcessingStatus.NOT_STARTED,
          owner: { connect: { id: 4 } },
          categories: { connect: [{ id: 2 }] },
        }),
      }),
    );
    expect(actualEntity).toEqual(BookMapper.toEntity(persistenceRow));
  });

  it('soft-deletes a book by setting deletedAt', async () => {
    const deletedRow = {
      ...persistenceRow,
      deletedAt: new Date('2026-08-16T00:00:00.000Z'),
    };
    mockPrismaProviderService.book.update.mockResolvedValue(deletedRow);
    const actualEntity = await bookPrismaRepository.delete(8);
    expect(mockPrismaProviderService.book.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 8 },
        data: { deletedAt: expect.any(Date) },
        include: bookDetailsInclude,
      }),
    );
    expect(actualEntity).toEqual(BookMapper.toEntity(deletedRow));
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

  it('lists books filtered by processing status', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    await bookPrismaRepository.list({
      limit: 20,
      offset: 0,
      processingStatus: BookProcessingStatus.READY,
    });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, processingStatus: BookProcessingStatus.READY },
        include: bookDetailsInclude,
      }),
    );
  });

  it('lists catalog books as approved ready published rows ordered by newest', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await bookPrismaRepository.listCatalog({
      limit: 20,
      offset: 0,
      sort: CatalogSort.NEWEST,
    });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          publishingStatus: BookPublishingStatus.APPROVED,
          processingStatus: BookProcessingStatus.READY,
          publishedAt: { not: null },
        },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        include: bookDetailsInclude,
      }),
    );
    expect(actualPage.total).toBe(1);
  });

  it('lists catalog books filtered by category and ordered by popularity', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    await bookPrismaRepository.listCatalog({
      limit: 20,
      offset: 0,
      categoryId: 2,
      sort: CatalogSort.POPULARITY,
    });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          publishingStatus: BookPublishingStatus.APPROVED,
          processingStatus: BookProcessingStatus.READY,
          publishedAt: { not: null },
          categories: { some: { id: 2, deletedAt: null } },
        },
        orderBy: [
          { readingProgresses: { _count: 'desc' } },
          { publishedAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    );
  });

  it('lists catalog books filtered by title, author, and publisher', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    await bookPrismaRepository.listCatalog({
      limit: 20,
      offset: 0,
      title: 'Harbor',
      author: 'Jane',
      publisher: 'Harbor Press',
      sort: CatalogSort.NEWEST,
    });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          publishingStatus: BookPublishingStatus.APPROVED,
          processingStatus: BookProcessingStatus.READY,
          publishedAt: { not: null },
          title: { contains: 'Harbor', mode: 'insensitive' },
          sourceMetadata: {
            is: {
              creator: { contains: 'Jane', mode: 'insensitive' },
              publisher: { contains: 'Harbor Press', mode: 'insensitive' },
            },
          },
        },
      }),
    );
  });

  it('lists catalog-visible books by id with a fixed id order', async () => {
    mockPrismaProviderService.book.findMany.mockResolvedValue([persistenceRow]);
    const actualBooks = await bookPrismaRepository.listCatalogByIds({ ids: [8, 9] });
    expect(mockPrismaProviderService.book.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: { not: null },
        id: { in: [8, 9] },
      },
      include: bookDetailsInclude,
      orderBy: [{ id: 'asc' }],
    });
    expect(actualBooks).toEqual([BookMapper.toEntity(persistenceRow)]);
  });

  it('counts catalog-visible books using the same visibility predicate', async () => {
    mockPrismaProviderService.book.count.mockResolvedValue(2);
    const actualCount = await bookPrismaRepository.countCatalogVisible({});
    expect(mockPrismaProviderService.book.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: { not: null },
      },
    });
    expect(actualCount).toBe(2);
  });

  it('counts catalog-visible books for one owner', async () => {
    mockPrismaProviderService.book.count.mockResolvedValue(1);
    await bookPrismaRepository.countCatalogVisible({ ownerId: 4 });
    expect(mockPrismaProviderService.book.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: { not: null },
        ownerId: 4,
      },
    });
  });
});
