import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { CategoryResponse } from './category.response';

describe('CategoryResponse', () => {
  it('projects taxonomy fields including category weight', () => {
    const inputEntity = new CategoryEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      name: 'Picture Books',
      slug: 'picture-books',
      categoryWeight: 1.25,
    });
    const actualResponse = new CategoryResponse(inputEntity);
    expect(actualResponse.id).toBe(1);
    expect(actualResponse.name).toBe('Picture Books');
    expect(actualResponse.slug).toBe('picture-books');
    expect(actualResponse.categoryWeight).toBe(1.25);
  });
});
