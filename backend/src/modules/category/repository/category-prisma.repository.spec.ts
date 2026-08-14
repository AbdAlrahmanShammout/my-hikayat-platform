import { Prisma } from '@prisma/client';

import { CategoryMapper } from '@/modules/category/mapper/category.mapper';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { CategoryPrismaRepository } from './category-prisma.repository';

describe('CategoryPrismaRepository', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-01T00:00:00.000Z');
  const persistenceRow = {
    id: 5,
    createdAt,
    updatedAt,
    deletedAt: null,
    name: 'Picture Books',
    slug: 'picture-books',
    categoryWeight: new Prisma.Decimal('1.2500'),
  };
  let mockPrismaProviderService: {
    $transaction: jest.Mock;
    category: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };
  let categoryPrismaRepository: CategoryPrismaRepository;

  beforeEach(() => {
    mockPrismaProviderService = {
      $transaction: jest.fn(),
      category: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    categoryPrismaRepository = new CategoryPrismaRepository(
      mockPrismaProviderService as unknown as PrismaProviderService,
    );
  });

  it('creates a category and maps the persistence payload', async () => {
    mockPrismaProviderService.category.create.mockResolvedValue(persistenceRow);
    const actualEntity = await categoryPrismaRepository.create({
      name: 'Picture Books',
      slug: 'picture-books',
      categoryWeight: 1.25,
    });
    expect(mockPrismaProviderService.category.create).toHaveBeenCalled();
    expect(actualEntity).toEqual(CategoryMapper.toEntity(persistenceRow));
  });

  it('returns null when findById misses an operational category', async () => {
    mockPrismaProviderService.category.findFirst.mockResolvedValue(null);
    const actualEntity = await categoryPrismaRepository.findById(5);
    expect(actualEntity).toBeNull();
    expect(mockPrismaProviderService.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5, deletedAt: null },
      }),
    );
  });

  it('lists categories with a real total', async () => {
    mockPrismaProviderService.$transaction.mockResolvedValue([[persistenceRow], 1]);
    const actualPage = await categoryPrismaRepository.list({ limit: 20, offset: 0 });
    expect(actualPage.total).toBe(1);
    expect(actualPage.entities).toEqual([CategoryMapper.toEntity(persistenceRow)]);
  });
});
