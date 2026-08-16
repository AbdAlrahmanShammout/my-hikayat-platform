import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination.constant';
import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AuditLogService } from '@/modules/audit/audit-log.service';
import { AuditAction, AuditSubjectType } from '@/modules/audit/enum/general.enum';
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

const actorUserId = 9;

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
  let mockAuditLogService: { append: jest.Mock };
  let mockTransactionRunner: { run: jest.Mock };
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
    mockAuditLogService = { append: jest.fn() };
    mockTransactionRunner = {
      run: jest.fn(async (work: (context: undefined) => Promise<unknown>) => work(undefined)),
    };
    collectionService = new CollectionService(
      mockCollectionRepository,
      mockBookService as unknown as BookService,
      mockAuditLogService as unknown as AuditLogService,
      mockTransactionRunner,
    );
  });

  describe('createCollection', () => {
    it('normalizes the title, assigns display order, and records an audit event', async () => {
      const expectedCollection = createSampleCollection();
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      mockCollectionRepository.create.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.createCollection({
        title: '  Harbor   Picks ',
        bookIds: [8, 8],
        actorUserId,
      });
      expect(mockBookService.getBookById).toHaveBeenCalledWith(8);
      expect(mockCollectionRepository.create).toHaveBeenCalledWith(
        {
          title: 'Harbor Picks',
          books: [{ bookId: 8, displayOrder: 0 }],
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_CREATED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { title: 'Harbor Picks', bookIds: [8] },
        },
        undefined,
      );
      expect(actualCollection).toBe(expectedCollection);
    });

    it('rejects an empty title before persisting', async () => {
      await expect(
        collectionService.createCollection({ title: '   ', actorUserId }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockCollectionRepository.create).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });
  });

  describe('updateCollection', () => {
    it('returns the current collection without writing when the title is omitted', async () => {
      const expectedCollection = createSampleCollection();
      mockCollectionRepository.findById.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.updateCollection({
        id: 3,
        actorUserId,
      });
      expect(mockCollectionRepository.update).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
      expect(actualCollection).toBe(expectedCollection);
    });

    it('updates the title and records the previous and next values', async () => {
      const current = createSampleCollection();
      const expectedCollection = createSampleCollection();
      mockCollectionRepository.findById.mockResolvedValue(current);
      mockCollectionRepository.update.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.updateCollection({
        id: 3,
        title: '  Harbor   Classics ',
        actorUserId,
      });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith(
        { id: 3, title: 'Harbor Classics' },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_UPDATED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { fromTitle: 'Harbor Picks', toTitle: 'Harbor Classics' },
        },
        undefined,
      );
      expect(actualCollection).toBe(expectedCollection);
    });
  });

  describe('addCollectionBook', () => {
    it('appends a book at the next display order and records an audit event', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      mockBookService.getBookById.mockResolvedValue(createSampleBook(9));
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.addCollectionBook({
        collectionId: 3,
        bookId: 9,
        actorUserId,
      });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith(
        {
          id: 3,
          books: [
            { bookId: 8, displayOrder: 0 },
            { bookId: 9, displayOrder: 1 },
          ],
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_BOOK_ADDED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { bookId: 9 },
        },
        undefined,
      );
    });

    it('rejects a book that is already in the collection without writing', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      mockBookService.getBookById.mockResolvedValue(createSampleBook());
      await expect(
        collectionService.addCollectionBook({ collectionId: 3, bookId: 8, actorUserId }),
      ).rejects.toBeInstanceOf(CollectionBookAlreadyAddedException);
      expect(mockCollectionRepository.update).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });
  });

  describe('removeCollectionBook', () => {
    it('removes a book, compact display order, and records an audit event', async () => {
      mockCollectionRepository.findById.mockResolvedValue(
        createSampleCollection([createSampleItem(8, 0), createSampleItem(9, 1)]),
      );
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.removeCollectionBook({
        collectionId: 3,
        bookId: 8,
        actorUserId,
      });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith(
        {
          id: 3,
          books: [{ bookId: 9, displayOrder: 0 }],
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_BOOK_REMOVED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { bookId: 8 },
        },
        undefined,
      );
    });

    it('hides a missing collection book as not found without writing', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      await expect(
        collectionService.removeCollectionBook({ collectionId: 3, bookId: 9, actorUserId }),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(mockCollectionRepository.update).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
    });
  });

  describe('reorderCollectionBooks', () => {
    it('rewrites display order for the same book set and records an audit event', async () => {
      mockCollectionRepository.findById.mockResolvedValue(
        createSampleCollection([createSampleItem(8, 0), createSampleItem(9, 1)]),
      );
      mockCollectionRepository.update.mockResolvedValue(createSampleCollection());
      await collectionService.reorderCollectionBooks({
        collectionId: 3,
        bookIds: [9, 8],
        actorUserId,
      });
      expect(mockCollectionRepository.update).toHaveBeenCalledWith(
        {
          id: 3,
          books: [
            { bookId: 9, displayOrder: 0 },
            { bookId: 8, displayOrder: 1 },
          ],
        },
        undefined,
      );
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_REORDERED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { bookIds: [9, 8] },
        },
        undefined,
      );
    });

    it('rejects a reorder that changes membership without writing', async () => {
      mockCollectionRepository.findById.mockResolvedValue(createSampleCollection());
      await expect(
        collectionService.reorderCollectionBooks({
          collectionId: 3,
          bookIds: [9],
          actorUserId,
        }),
      ).rejects.toBeInstanceOf(InvalidStateException);
      expect(mockCollectionRepository.update).not.toHaveBeenCalled();
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
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
      expect(mockAuditLogService.append).not.toHaveBeenCalled();
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
    it('soft-deletes an existing collection and records an audit event', async () => {
      const expectedCollection = createSampleCollection();
      mockCollectionRepository.findById.mockResolvedValue(expectedCollection);
      mockCollectionRepository.delete.mockResolvedValue(expectedCollection);
      const actualCollection = await collectionService.deleteCollection({
        id: 3,
        actorUserId,
      });
      expect(mockCollectionRepository.delete).toHaveBeenCalledWith(3, undefined);
      expect(mockAuditLogService.append).toHaveBeenCalledWith(
        {
          actorUserId,
          action: AuditAction.COLLECTION_DELETED,
          subjectType: AuditSubjectType.COLLECTION,
          subjectId: 3,
          metadata: { title: 'Harbor Picks', bookIds: [8] },
        },
        undefined,
      );
      expect(actualCollection).toBe(expectedCollection);
    });
  });
});
