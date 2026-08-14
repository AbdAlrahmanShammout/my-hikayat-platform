import { CategoryEntity } from './category.entity';

describe('CategoryEntity', () => {
  it('holds taxonomy identity and category weight', () => {
    const actualEntity = new CategoryEntity({
      id: 2,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      name: 'Picture Books',
      slug: 'picture-books',
      categoryWeight: 1.25,
    });
    expect(actualEntity.id).toBe(2);
    expect(actualEntity.name).toBe('Picture Books');
    expect(actualEntity.slug).toBe('picture-books');
    expect(actualEntity.categoryWeight).toBe(1.25);
  });
});
