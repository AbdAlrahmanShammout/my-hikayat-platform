import { CollectionBookEntity } from './collection-book.entity';

describe('CollectionBookEntity', () => {
  it('holds a collection book locator and display order', () => {
    const actualEntity = new CollectionBookEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      collectionId: 3,
      bookId: 8,
      displayOrder: 0,
    });
    expect(actualEntity.collectionId).toBe(3);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.displayOrder).toBe(0);
  });
});
