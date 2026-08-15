import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionBookAlreadyAddedException } from '@/modules/collection/exceptions/collection-book-already-added.exception';

import { CollectionService } from './collection.service';

function createSampleBook(id = 8): BookEntity {
  return new BookEntity({
    id,
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

function createSampleItem(bookId: number, displayOrder: number): CollectionBookEntity {
  return new CollectionBookEntity({
    id: bookId + 10,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    collectionId: 3,
    bookId,
    displayOrder,
  });
}

function createSampleCollection(
  items: CollectionBookEntity[] = [createSampleItem(8, 0)],
): CollectionEntity {
  return new CollectionEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Harbor Picks',
    items,
  });
}

describe('CollectionService', () => {
  let mockCollectionRepository: {
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findById: jest.Mock;
    list: jest.Mock;
  };
  let mockBookService: { getBookById: jest.Mock };
  let collectionService: CollectionService;

  beforeEach(() => {
    mockCollectionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
    };
    mockBookService = { getBookById: jest.fn() };
    collectionService = new CollectionService(
      mockCollectionRepository,
      mockBookService as unknown as BookService,
    );
  });

  describe('createCollection', () => {
    it('normalizes the title and assigns display order', async () => {
      const expectedCollection = createSampleCollection();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockCollectionRepository.create.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.createCollection({
        title: '  Harbor   Picks ',
        bookIds: [8, 8],
      });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockCollectionRepository.create).toHaveBeenCalledWith({
        title: 'Harbor Picks',
        books: [{ bookId: 8, displayOrder: 0 }],
      });
      expect(actualCollection).toBe(expectedCollection);
    });

    it('rejects an empty title', async () => {
      await expect(collectionService.createCollection({ title: '   ' })).rejects.toBeInstanceOf(
        InvalidStateException,
      );
    });
  });

  describe('addCollectionBook', () => {
    it('appends a book at the next display order', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      mockBookService.getBookById.mockResolvedValue(createSampleBook(9));
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.addCollectionBook({ collectionId: 3, bookId: 9 });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith({
        id: 3,
        books: [
          { bookId: 8, displayOrder: 0 },
          { bookId: 9, displayOrder: 1 },
        ],
      });
    });

    it('rejects a book that is already in the collection', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        collectionService.addCollectionBook({ collectionId: 3, bookId: 8 }),
      ).rejects.toBeInstanceOf(CollectionBookAlreadyAddedException);
    });
  });

  describe('removeCollectionBook', () => {
    it('removes a book and compact display order', async () => {
      mockCollectionRepository.findById.mockResolvedValue(
        createSampleCollection([createSampleItem(8, 0), createSampleItem(9, 1)]),
      );
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.removeCollectionBook({ collectionId: 3, bookId: 8 });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith({
        id: 3,
        books: [{ bookId: 9, displayOrder: 0 }],
      });
    });

    it('hides a missing collection book as not found', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      await expect(
        collectionService.removeCollectionBook({ collectionId: 3, bookId: 9 }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });
  });

  describe('reorderCollectionBooks', () => {
    it('rewrites display order for the same book set', async () => {
      mockCollectionRepository.findById.mockResolvedValue(
        createSampleCollection([createSampleItem(8, 0), createSampleItem(9, 1)]),
      );
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.reorderCollectionBooks({
        collectionId: 3,
        bookIds: [9, 8],
      });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith({
        id: 3,
        books: [
          { bookId: 9, displayOrder: 0 },
          { bookId: 8, displayOrder: 1 },
        ],
      });
    });

    it('rejects a reorder that changes membership', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      await expect(
        collectionService.reorderCollectionBooks({ collectionId: 3, bookIds: [9] }),
      ).rejects.toBeInstanceOf(InvalidStateException);
    });
  });

  describe('listCollections', () => {
    it('applies default pagination', async () => {
      mockCollectionRepository.list.mockResolvedValue({
        entities: [createSampleCollection()],
        total: 1,
      });
      const actualPage = await collectionService.listCollections();
      expect(mockCollectionRepository.list).toHaveBeenCalledWith({
        limit: DEFAULT_PAGE_SIZE,
        offset: DEFAULT_PAGE_OFFSET,
      });
      expect(actualPage.total).toBe(1);
    });
  });

  describe('getCollectionById', () => {
    it('throws when the collection is missing', async () => {
      mockCollectionRepository.findById.mockResolvedValue(null);
      await expect(collectionService.getCollectionById(99)).rejects.toBeInstanceOf(
        ResourceNotFoundException,
      );
    });
  });

  describe('deleteCollection', () => {
    it('soft-deletes an existing collection', async () => {
      const expectedCollection = createSampleCollection();
      mockCollectionRepository.findById.mockResolvedValue(expectedCollection);
      mockCollectionRepository.delete.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.deleteCollection(3);
      expect(mockCollectionRepository.delete).toHaveBeenCalledWith(3);
      expect(actualCollection).toBe(expectedCollection);
    });
  });
});
