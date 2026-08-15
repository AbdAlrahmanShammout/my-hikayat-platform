import { BookService } from '@/modules/book/book.service';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CollectionService } from '@/modules/collection/collection.service';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { CollectionDiscoveryService } from './collection-discovery.service';

function createCatalogBook(id: number, title: string): BookEntity {
  return new BookEntity({
    id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title,
    description: 'A published catalog book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
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
  items: CollectionBookEntity[] = [createSampleItem(8, 0), createSampleItem(9, 1)],
): CollectionEntity {
  return new CollectionEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Harbor Picks',
    items,
  });
}

describe('CollectionDiscoveryService', () => {
  let mockCollectionService: { listCollections: jest.Mock; getCollectionById: jest.Mock };
  let mockBookService: { listCatalogBooksByIds: jest.Mock };
  let collectionDiscoveryService: CollectionDiscoveryService;

  beforeEach(() => {
    mockCollectionService = { listCollections: jest.fn(), getCollectionById: jest.fn() };
    mockBookService = { listCatalogBooksByIds: jest.fn() };
    collectionDiscoveryService = new CollectionDiscoveryService(
      mockCollectionService as unknown as CollectionService,
      mockBookService as unknown as BookService,
    );
  });

  describe('listDiscoveryCollections', () => {
    it('hydrates published books in editorial order and omits unpublished membership', async () => {
      const firstBook = createCatalogBook(9, 'Mountain Paths');
      mockCollectionService.listCollections.mockResolvedValue({
        entities: [createSampleCollection()],
        total: 1,
      });
      mockBookService.listCatalogBooksByIds.mockResolvedValue([firstBook]);
      const actualPage = await collectionDiscoveryService.listDiscoveryCollections({
        limit: 10,
        offset: 0,
      });
      expect(mockCollectionService.listCollections).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(mockBookService.listCatalogBooksByIds).toHaveBeenCalledWith([8, 9]);
      expect(actualPage.total).toBe(1);
      expect(actualPage.entities[0].collection.title).toBe('Harbor Picks');
      expect(actualPage.entities[0].books.map((book) => book.id)).toEqual([9]);
    });
  });

  describe('getDiscoveryCollectionById', () => {
    it('returns published books in collection display order', async () => {
      const firstBook = createCatalogBook(8, 'Harbor Lights');
      const secondBook = createCatalogBook(9, 'Mountain Paths');
      mockCollectionService.getCollectionById.mockResolvedValue(
        createSampleCollection([createSampleItem(9, 0), createSampleItem(8, 1)]),
      );
      mockBookService.listCatalogBooksByIds.mockResolvedValue([firstBook, secondBook]);
      const actualDiscovery = await collectionDiscoveryService.getDiscoveryCollectionById(3);
      expect(mockCollectionService.getCollectionById).toHaveBeenCalledWith(3);
      expect(actualDiscovery.books.map((book) => book.id)).toEqual([9, 8]);
    });
  });
});
