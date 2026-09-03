import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookCatalogCoverService } from '@/modules/book-asset/book-catalog-cover.service';
import { CollectionDiscoveryService } from '@/modules/collection/collection-discovery.service';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { CollectionReaderController } from './collection.reader.controller';

function createCatalogBook(): BookEntity {
  return new BookEntity({
    id: 8,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'The Last Lighthouse',
    description: 'A reflowable chapter book.',
    layoutType: BookLayoutType.REFLOWABLE,
    bookType: BookType.STANDARD_CHAPTER,
    publishingStatus: BookPublishingStatus.APPROVED,
    processingStatus: BookProcessingStatus.READY,
    publishedAt: new Date('2026-08-15T00:00:00.000Z'),
    ownerId: 4,
    categories: [],
  });
}

function createSampleCollection(): CollectionEntity {
  return new CollectionEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title: 'Harbor Picks',
    items: [],
  });
}

describe('CollectionReaderController', () => {
  let collectionReaderController: CollectionReaderController;
  let mockCollectionDiscoveryService: {
    listDiscoveryCollections: jest.Mock;
    getDiscoveryCollectionById: jest.Mock;
  };
  let mockBookCatalogCoverService: { toBookResponses: jest.Mock };

  beforeEach(async () => {
    mockCollectionDiscoveryService = {
      listDiscoveryCollections: jest.fn(),
      getDiscoveryCollectionById: jest.fn(),
    };
    mockBookCatalogCoverService = {
      toBookResponses: jest.fn(async (books: BookEntity[]) =>
        books.map((book) => new BookResponse(book, null)),
      ),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CollectionReaderController],
      providers: [
        { provide: CollectionDiscoveryService, useValue: mockCollectionDiscoveryService },
        { provide: BookCatalogCoverService, useValue: mockBookCatalogCoverService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    collectionReaderController = moduleRef.get(CollectionReaderController);
  });

  describe('listDiscoveryCollections', () => {
    it('maps pagination fields into the discovery service', async () => {
      mockCollectionDiscoveryService.listDiscoveryCollections.mockResolvedValue({
        entities: [{ collection: createSampleCollection(), books: [createCatalogBook()] }],
        total: 1,
      });
      const actualResponse = await collectionReaderController.listDiscoveryCollections({
        limit: 10,
        offset: 0,
      });
      expect(mockCollectionDiscoveryService.listDiscoveryCollections).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.collections[0].title).toBe('Harbor Picks');
      expect(actualResponse.collections[0].books[0].id).toBe(8);
      expect(actualResponse.collections[0].books[0].cover).toBeNull();
    });
  });

  describe('getDiscoveryCollection', () => {
    it('returns the requested discovery collection', async () => {
      mockCollectionDiscoveryService.getDiscoveryCollectionById.mockResolvedValue({
        collection: createSampleCollection(),
        books: [createCatalogBook()],
      });
      const actualResponse = await collectionReaderController.getDiscoveryCollection(3);
      expect(mockCollectionDiscoveryService.getDiscoveryCollectionById).toHaveBeenCalledWith(3);
      expect(actualResponse.id).toBe(3);
      expect(actualResponse.books[0].title).toBe('The Last Lighthouse');
    });
  });
});
