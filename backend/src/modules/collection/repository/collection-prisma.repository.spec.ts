import { CollectionMapper } from '@/modules/collection/mapper/collection.mapper';
import { collectionDetailsInclude } from '@/modules/collection/types/collection-details.include';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { CollectionPrismaRepository } from './collection-prisma.repository';

describe('CollectionPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 3,
    createdAt,
    updatedAt,
    deletedAt: null,
    title: 'Harbor Picks',
    items: [
      {
        id: 9,
        createdAt,
        updatedAt,
        collectionId: 3,
        bookId: 8,
        displayOrder: 0,
      },
    ],
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    collection: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    collectionBook: {
      createMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let collectionPrismaRepository: CollectionPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      collection: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      collectionBook: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    collectionPrismaRepository = new CollectionPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a collection with ordered books', async () => {
    mockPrismaProviderService.collection.create.mockResolvedValue(persistenceRow);
    const actualEntity = await collectionPrismaRepository.create({
      title: 'Harbor Picks',
      books: [{ bookId: 8, displayOrder: 0 }],
    });
    expect(mockPrismaProviderService.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        include: collectionDetailsInclude,
      }),
    );
    expect(actualEntity).toEqual(CollectionMapper.toEntity(persistenceRow));
  });

  it('returns null when findById misses an operational collection', async () => {
    mockPrismaProviderService.collection.findFirst.mockResolvedValue(null);
    const actualEntity = await collectionPrismaRepository.findById(3);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.collection.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3, deletedAt: null },
        include: collectionDetailsInclude,
      }),
    );
  });

  it('replaces collection books inside a transaction', async () => {
    mockPrismaProviderService.$transaction.mockImplementation(
      async (work: (client: unknown) => Promise<unknown>) => work(mockPrismaProviderService),
    );
    mockPrismaProviderService.collection.update.mockResolvedValue(persistenceRow);
    const actualEntity = await collectionPrismaRepository.update({
      id: 3,
      books: [{ bookId: 8, displayOrder: 0 }],
    });
    expect(mockPrismaProviderService.collectionBook.deleteMany).toHaveBeenCalledWith({
      where: { collectionId: 3 },
    });
    expect(mockPrismaProviderService.collectionBook.createMany).toHaveBeenCalledWith({
      data: [{ collectionId: 3, bookId: 8, displayOrder: 0 }],
    });
    expect(actualEntity.title).toBe('Harbor Picks');
  });

  it('lists collections with a real total', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await collectionPrismaRepository.list({ limit: 20, offset: 0 });
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([CollectionMapper.toEntity(persistenceRow)]);
  });
});
