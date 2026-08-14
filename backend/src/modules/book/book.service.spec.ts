import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { BookService } from './book.service';

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
  let bookService: BookService;

  beforeEach(() => {
    mockBookRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };
    mockCategoryService = { getCategoryById: jest.fn() };
    bookService = new BookService(
      mockBookRepository,
      mockCategoryService as unknown as CategoryService,
    );
  });

  describe('createBook', () => {
    it('creates a pending book after verifying categories', async () => {
      const expectedBook = createSampleBook();
      mockCategoryService.getCategoryById.mockResolvedValue(createSampleCategory());
      mockBookRepository.create.mockResolvedValue(expectedBook);
      const actualBook = await bookService.createBook({
        title: '  The   Last Lighthouse ',
        description: '  A reflowable chapter book.  ',
        bookType: BookType.STANDARD_CHAPTER,
        categoryIds: [2, 2],
      });
      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(2);
      expect(mockBookRepository.create).toHaveBeenCalledWith({
        title: 'The Last Lighthouse',
        description: 'A reflowable chapter book.',
        layoutType: null,
        bookType: BookType.STANDARD_CHAPTER,
        publishingStatus: BookPublishingStatus.PENDING,
        categoryIds: [2],
      });
      expect(actualBook).toBe(expectedBook);
    });

    it('rejects an empty title', async () => {
      await expect(
        bookService.createBook({
          title: '   ',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });

    it('propagates a missing category', async () => {
      mockCategoryService.getCategoryById.mockRejectedValue(
        new ResourceNotFoundException('Category', 99),
      );
      await expect(
        bookService.createBook({
          title: 'The Last Lighthouse',
          description: 'A reflowable chapter book.',
          bookType: BookType.STANDARD_CHAPTER,
          categoryIds: [99],
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockBookRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBook', () => {
    it('updates layout after processing detection', async () => {
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
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getBookById', () => {
    it('throws when the book is missing', async () => {
      mockBookRepository.findById.mockResolvedValue(null);
      await expect(bookService.getBookById(99)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });
});
