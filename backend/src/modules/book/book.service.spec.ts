import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { CatalogSort } from '@/modules/book/enum/catalog-sort.enum';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookOwnerNotPublisherException } from '@/modules/book/exceptions/book-owner-not-publisher.exception';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';
import { UserService } from '@/modules/user/user.service';

import { BookService } from './book.service';

function createSamplePublisher(): UserEntity {
  return new UserEntity({
    id: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'author@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

function createSampleReader(): UserEntity {
  return new UserEntity({
    id: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'reader@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.READER,
    isPublisher: false,
  });
}

function createSampleBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: null,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.PENDING,
    processingStatus: BookProcessingStatus.NOT_STARTED,
    publishedAt: null,
    ownerId: 4,
    categories: [],
  });
}

function createSampleCategory(): CategoryEntity {
  return new CategoryEntity({
    id: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    name: 'Picture Books',
    slug: 'picture-books',
    categoryWeight: 1.25,
  });
}

describe('BookService', () => {
  let mockBookRepository: {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findById: jest.Mock;
    list: jest.Mock;
    listCatalog: jest.Mock;
    listCatalogByIds: jest.Mock;
  };
  let mockCategoryService: { getCategoryById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
  let bookService: BookService;

  beforeEach(() => {
    mockBookRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      listCatalog: jest.fn(),
      listCatalogByIds: jest.fn(),
    };
    mockCategoryService = { getCategoryById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    bookService = new BookService(
      mockBookRepository,
      mockCategoryService as unknown as CategoryService,
      mockUserService as unknown as UserService,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  describe('createBook', () => {
    it('creates a pending book after verifying the publisher owner and categories', async () => {
      const expectedBook = createSampleBook();
      mockUserService.getUserById.mockResolvedValue(createSamplePublisher());
      mockCategoryService.getCategoryById.mockResolvedValue(createSampleCategory());
      mockBookRepository.create.mockResolvedValue(expectedBook);
      const actualBook = await bookService.createBook({
        title: '  The   Last Lighthouse ',
        description: '  A reflowable chapter book.  ',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: 4,
        categoryIds: [2, 2],
      });
      expect(mockUserService.getUserById).toHaveBeenCalledWith(4);
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(2);
      expect(mockBookRepository.create).toHaveBeenCalledWith({
        title: 'The Last Lighthouse',
        description: 'A reflowable chapter book.',
        layoutType: null,
        bookType: BookType.STANDARD_CHAPTER,
        publishingStatus: BookPublishingStatus.PENDING,
        processingStatus: BookProcessingStatus.NOT_STARTED,
        ownerId: 4,
        categoryIds: [2],
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects an empty title before looking up the owner', async () => {
      await expect(
        bookService.createBook({
          title: '   ',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
          ownerId: 4,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('allows an admin publisher to own a book', async () => {
      const expectedBook = createSampleBook();
      mockUserService.getUserById.mockResolvedValue(
        new UserEntity({
          id: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          email: 'admin@example.com',
          passwordHash: 'hashed-password',
          role: UserRole.ADMIN,
          isPublisher: true,
        }),
      );
      mockBookRepository.create.mockResolvedValue(expectedBook);
      await bookService.createBook({
        title: 'The Last Lighthouse',
        description: 'A reflowable chapter book.',
        bookType: BookType.STANDARD_CHAPTER,
        ownerId: 1,
      });
      expect(mockBookRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 1 }),
      );
    });

    it('rejects an owner without publisher capability', async () => {
      mockUserService.getUserById.mockResolvedValue(createSampleReader());
      await expect(
        bookService.createBook({
          title: 'The Last Lighthouse',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
          ownerId: 5,
        }),
      ).rejects.toBeInstanceOf(BookOwnerNotPublisherException);
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('propagates a missing owner', async () => {
      mockUserService.getUserById.mockRejectedValue(new ResourceNotFoundException('User', 99));
      await expect(
        bookService.createBook({
          title: 'The Last Lighthouse',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
          ownerId: 99,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('propagates a missing category', async () => {
      mockUserService.getUserById.mockResolvedValue(createSamplePublisher());
      mockCategoryService.getCategoryById.mockRejectedValue(
        new ResourceNotFoundException('Category', 99),
      );
      await expect(
        bookService.createBook({
          title: 'The Last Lighthouse',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
          ownerId: 4,
          categoryIds: [99],
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBook', () => {
    it('updates layout after processing detection without changing the owner', async () => {
      const current = createSampleBook();
      const expectedBook = new BookEntity({
        ...current,
        layoutType: BookLayoutType.REFLOWABLE,
      });
      mockBookRepository.findById.mockResolvedValue(current);
      mockBookRepository.update.mockResolvedValue(expectedBook);
      const actualBook = await bookService.updateBook({
        id: 8,
        layoutType: BookLayoutType.REFLOWABLE,
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith({
        id: 8,
        title: undefined,
        description: undefined,
        layoutType: BookLayoutType.REFLOWABLE,
        bookType: undefined,
        publishingStatus: undefined,
        publishedAt: undefined,
        categoryIds: undefined,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(bookService.updateBook({ id: 99, title: 'Gone' })).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('deleteBook', () => {
    it('soft-deletes a book and records an audit event', async () => {
      const current = createSampleBook();
      mockBookRepository.findById.mockResolvedValue(current);
      mockBookRepository.delete.mockResolvedValue(current);
      const actualBook = await bookService.deleteBook({ bookId: 8, actorUserId: 9 });
      expect(mockBookRepository.delete).toHaveBeenCalledWith(8, undefined);
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId: 9,
          action: AuditAction.BOOK_DELETED,
          subjectType: AuditSubjectType.BOOK,
          subjectId: 8,
          metadata: {
            publishingStatus: BookPublishingStatus.PENDING,
            publishedAt: null,
          },
        },
        undefined,
      );
      expect(actualBook).toBe(current);
    });

    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(bookService.deleteBook({ bookId: 99, actorUserId: 9 })).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
      expect(mockBookRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('listBooks', () => {
    it('applies default pagination', async () => {
      mockBookRepository.list.mockResolvedValue({ entities: [createSampleBook()], total: 1 });
      const actualPage = await bookService.listBooks();
      expect(mockBookRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        publishingStatus: undefined,
        ownerId: undefined,
        processingStatus: undefined,
      });
      expect(actualPage.total).toBe(1);
    });

    it('filters by owner', async () => {
      mockBookRepository.list.mockResolvedValue({ entities: [createSampleBook()], total: 1 });
      await bookService.listBooks({ ownerId: 4 });
      expect(mockBookRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        publishingStatus: undefined,
        ownerId: 4,
        processingStatus: undefined,
      });
    });

    it('filters by processing status', async () => {
      mockBookRepository.list.mockResolvedValue({ entities: [createSampleBook()], total: 1 });
      await bookService.listBooks({ processingStatus: BookProcessingStatus.READY });
      expect(mockBookRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        publishingStatus: undefined,
        ownerId: undefined,
        processingStatus: BookProcessingStatus.READY,
      });
    });
  });

  describe('listCatalogBooks', () => {
    it('lists published catalog books with newest as the default sort', async () => {
      mockBookRepository.listCatalog.mockResolvedValue({
        entities: [createSampleBook()],
        total: 1,
      });
      const actualPage = await bookService.listCatalogBooks();
      expect(mockBookRepository.listCatalog).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        categoryId: undefined,
        title: undefined,
        author: undefined,
        publisher: undefined,
        sort: CatalogSort.NEWEST,
      });
      expect(actualPage.total).toBe(1);
    });

    it('verifies the category exists before filtering', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(createSampleCategory());
      mockBookRepository.listCatalog.mockResolvedValue({ entities: [], total: 0 });
      await bookService.listCatalogBooks({
        categoryId: 2,
        sort: CatalogSort.POPULARITY,
      });
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(2);
      expect(mockBookRepository.listCatalog).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        categoryId: 2,
        title: undefined,
        author: undefined,
        publisher: undefined,
        sort: CatalogSort.POPULARITY,
      });
    });

    it('passes normalized title, author, and publisher filters', async () => {
      mockBookRepository.listCatalog.mockResolvedValue({ entities: [], total: 0 });
      await bookService.listCatalogBooks({
        title: '  Harbor Lights  ',
        author: 'Jane Author',
        publisher: 'Harbor Press',
      });
      expect(mockBookRepository.listCatalog).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        categoryId: undefined,
        title: 'Harbor Lights',
        author: 'Jane Author',
        publisher: 'Harbor Press',
        sort: CatalogSort.NEWEST,
      });
    });
  });

  describe('getCatalogBookById', () => {
    it('returns an approved ready published book', async () => {
      const expectedBook = new BookEntity({
        ...createSampleBook(),
        publishingStatus: BookPublishingStatus.APPROVED,
        processingStatus: BookProcessingStatus.READY,
        publishedAt: new Date('2026-08-15T00:00:00.000Z'),
      });
      mockBookRepository.findById.mockResolvedValue(expectedBook);
      const actualBook = await bookService.getCatalogBookById(8);
      expect(actualBook).toBe(expectedBook);
    });

    it('hides a pending book as not found', async () => {
      mockBookRepository.findById.mockResolvedValue(createSampleBook());
      await expect(bookService.getCatalogBookById(8)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });

    it('hides an approved book without publishedAt as not found', async () => {
      mockBookRepository.findById.mockResolvedValue(
        new BookEntity({
          ...createSampleBook(),
          publishingStatus: BookPublishingStatus.APPROVED,
          processingStatus: BookProcessingStatus.READY,
          publishedAt: null,
        }),
      );
      await expect(bookService.getCatalogBookById(8)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('getBookById', () => {
    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(bookService.getBookById(99)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('getManagedBook', () => {
    it('returns a book owned by the actor', async () => {
      const expectedBook = createSampleBook();
      mockBookRepository.findById.mockResolvedValue(expectedBook);
      const actualBook = await bookService.getManagedBook({
        bookId: 8,
        actorId: 4,
        actorRole: UserRole.AUTHOR,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('returns a foreign book to an admin', async () => {
      const expectedBook = createSampleBook();
      mockBookRepository.findById.mockResolvedValue(expectedBook);
      const actualBook = await bookService.getManagedBook({
        bookId: 8,
        actorId: 9,
        actorRole: UserRole.ADMIN,
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('hides a foreign book from another author', async () => {
      mockBookRepository.findById.mockResolvedValue(createSampleBook());
      await expect(
        bookService.getManagedBook({
          bookId: 8,
          actorId: 99,
          actorRole: UserRole.AUTHOR,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });

    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(
        bookService.getManagedBook({
          bookId: 99,
          actorId: 4,
          actorRole: UserRole.AUTHOR,
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('listCatalogBooksByIds', () => {
    it('returns an empty list without querying when no ids are provided', async () => {
      const actualBooks = await bookService.listCatalogBooksByIds([]);
      expect(mockBookRepository.listCatalogByIds).not.toHaveBeenCalled();
      expect(actualBooks).toEqual([]);
    });

    it('loads unique catalog-visible books by id', async () => {
      const expectedBook = createSampleBook();
      mockBookRepository.listCatalogByIds.mockResolvedValue([expectedBook]);
      const actualBooks = await bookService.listCatalogBooksByIds([8, 8]);
      expect(mockBookRepository.listCatalogByIds).toHaveBeenCalledWith({ ids: [8] });
      expect(actualBooks).toEqual([expectedBook]);
    });
  });
});
