import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { GetCategoriesResponseDto } from './get-categories-response.dto';

describe('GetCategoriesResponseDto', () => {
  it('maps a category page into the category envelope', () => {
    const inputEntity = new CategoryEntity({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      name: 'Picture Books',
      slug: 'picture-books',
      categoryWeight: 1.25,
    });
    const actualResponse = new GetCategoriesResponseDto({ entities: [inputEntity], total: 4 });
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.categories).toHaveLength(1);
    expect(actualResponse.categories[0].id).toBe(1);
    expect(actualResponse.categories[0].categoryWeight).toBe(1.25);
  });
});
