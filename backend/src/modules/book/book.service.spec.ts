import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
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
    findById: jest.Mock;
    list: jest.Mock;
  };
  let mockCategoryService: { getCategoryById: jest.Mock };
  let mockUserService: { getUserById: jest.Mock };
  let bookService: BookService;

  beforeEach(() => {
    mockBookRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };
    mockCategoryService = { getCategoryById: jest.fn() };
    mockUserService = { getUserById: jest.fn() };
    bookService = new BookService(
      mockBookRepository,
      mockCategoryService as unknown as CategoryService,
      mockUserService as unknown as UserService,
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

  describe('listBooks', () => {
    it('applies default pagination', async () => {
      mockBookRepository.list.mockResolvedValue({ entities: [createSampleBook()], total: 1 });
      const actualPage = await bookService.listBooks();
      expect(mockBookRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
        publishingStatus: undefined,
        ownerId: undefined,
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
      });
    });
  });

  describe('getBookById', () => {
    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(bookService.getBookById(99)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });
});
