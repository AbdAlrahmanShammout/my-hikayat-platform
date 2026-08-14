import { Prisma } from '@prisma/client';

import { CategoryType } from '@/modules/category/types/category-details-schema.type';

import { CategoryMapper } from './category.mapper';

describe('CategoryMapper', () => {
  it('maps a persistence payload onto a CategoryEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: CategoryType = {
      id: 4,
      createdAt,
      updatedAt,
      deletedAt: null,
      name: 'Picture Books',
      slug: 'picture-books',
      categoryWeight: new Prisma.Decimal('1.2500'),
    };
    const actualEntity = CategoryMapper.toEntity(inputSchema);
    expect(actualEntity.id).toBe(4);
    expect(actualEntity.name).toBe('Picture Books');
    expect(actualEntity.slug).toBe('picture-books');
    expect(actualEntity.categoryWeight).toBe(1.25);
  });
});
