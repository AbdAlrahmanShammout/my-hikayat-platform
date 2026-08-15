import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CollectionService } from '@/modules/collection/collection.service';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { CollectionAdminController } from './collection.admin.controller';

function createSampleCollection(title = 'Harbor Picks'): CollectionEntity {
  return new CollectionEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    title,
    items: [
      new CollectionBookEntity({
        id: 9,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        collectionId: 3,
        bookId: 8,
        displayOrder: 0,
      }),
      new CollectionBookEntity({
        id: 10,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        collectionId: 3,
        bookId: 9,
        displayOrder: 1,
      }),
    ],
  });
}

describe('CollectionAdminController', () => {
  let collectionAdminController: CollectionAdminController;
  let mockCollectionService: {
    createCollection: jest.Mock;
    listCollections: jest.Mock;
    getCollectionById: jest.Mock;
    updateCollection: jest.Mock;
    deleteCollection: jest.Mock;
    addCollectionBook: jest.Mock;
    removeCollectionBook: jest.Mock;
    reorderCollectionBooks: jest.Mock;
  };

  beforeEach(async () => {
    mockCollectionService = {
      createCollection: jest.fn(),
      listCollections: jest.fn(),
      getCollectionById: jest.fn(),
      updateCollection: jest.fn(),
      deleteCollection: jest.fn(),
      addCollectionBook: jest.fn(),
      removeCollectionBook: jest.fn(),
      reorderCollectionBooks: jest.fn(),
    };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CollectionAdminController],
      providers: [
        { provide: CollectionService, useValue: mockCollectionService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    collectionAdminController = moduleRef.get(CollectionAdminController);
  });

  describe('createCollection', () => {
    it('maps title and book ids into the service', async () => {
      mockCollectionService.createCollection.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.createCollection({
        title: 'Harbor Picks',
        bookIds: [8, 9],
      });
      expect(mockCollectionService.createCollection).toHaveBeenCalledWith({
        title: 'Harbor Picks',
        bookIds: [8, 9],
      });
      expect(actualResponse.id).toBe(3);
      expect(actualResponse.items.map((item) => item.bookId)).toEqual([8, 9]);
    });
  });

  describe('listCollections', () => {
    it('maps pagination fields into the service', async () => {
      mockCollectionService.listCollections.mockResolvedValue({
        entities: [createSampleCollection()],
        total: 1,
      });
      const actualResponse = await collectionAdminController.listCollections({
        limit: 10,
        offset: 0,
      });
      expect(mockCollectionService.listCollections).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(actualResponse.total).toBe(1);
      expect(actualResponse.collections[0].title).toBe('Harbor Picks');
    });
  });

  describe('getCollection', () => {
    it('returns the requested collection', async () => {
      mockCollectionService.getCollectionById.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.getCollection(3);
      expect(mockCollectionService.getCollectionById).toHaveBeenCalledWith(3);
      expect(actualResponse.id).toBe(3);
    });
  });

  describe('updateCollection', () => {
    it('maps the optional title into the service', async () => {
      mockCollectionService.updateCollection.mockResolvedValue(
        createSampleCollection('Harbor Classics'),
      );
      const actualResponse = await collectionAdminController.updateCollection(3, {
        title: 'Harbor Classics',
      });
      expect(mockCollectionService.updateCollection).toHaveBeenCalledWith({
        id: 3,
        title: 'Harbor Classics',
      });
      expect(actualResponse.title).toBe('Harbor Classics');
    });
  });

  describe('deleteCollection', () => {
    it('soft-deletes through the service', async () => {
      mockCollectionService.deleteCollection.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.deleteCollection(3);
      expect(mockCollectionService.deleteCollection).toHaveBeenCalledWith(3);
      expect(actualResponse.id).toBe(3);
    });
  });

  describe('addCollectionBook', () => {
    it('maps the collection id and book id into the service', async () => {
      mockCollectionService.addCollectionBook.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.addCollectionBook(3, { bookId: 11 });
      expect(mockCollectionService.addCollectionBook).toHaveBeenCalledWith({
        collectionId: 3,
        bookId: 11,
      });
      expect(actualResponse.id).toBe(3);
    });
  });

  describe('removeCollectionBook', () => {
    it('maps the named book id into the service', async () => {
      mockCollectionService.removeCollectionBook.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.removeCollectionBook(3, 9);
      expect(mockCollectionService.removeCollectionBook).toHaveBeenCalledWith({
        collectionId: 3,
        bookId: 9,
      });
      expect(actualResponse.id).toBe(3);
    });
  });

  describe('reorderCollectionBooks', () => {
    it('maps the complete book id list into the service', async () => {
      mockCollectionService.reorderCollectionBooks.mockResolvedValue(createSampleCollection());
      const actualResponse = await collectionAdminController.reorderCollectionBooks(3, {
        bookIds: [9, 8],
      });
      expect(mockCollectionService.reorderCollectionBooks).toHaveBeenCalledWith({
        collectionId: 3,
        bookIds: [9, 8],
      });
      expect(actualResponse.id).toBe(3);
    });
  });
});
