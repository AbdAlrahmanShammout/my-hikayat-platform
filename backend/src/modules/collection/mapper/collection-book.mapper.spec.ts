import { CollectionBookMapper } from './collection-book.mapper';

describe('CollectionBookMapper', () => {
  it('maps a persistence payload onto a CollectionBookEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = CollectionBookMapper.toEntity({
      id: 9,
      createdAt,
      updatedAt,
      collectionId: 3,
      bookId: 8,
      displayOrder: 1,
    });
    expect(actualEntity.id).toBe(9);
    expect(actualEntity.collectionId).toBe(3);
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.displayOrder).toBe(1);
  });
});
