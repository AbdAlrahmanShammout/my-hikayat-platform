import { CollectionMapper } from './collection.mapper';

describe('CollectionMapper', () => {
  it('maps a persistence payload onto a CollectionEntity', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const actualEntity = CollectionMapper.toEntity({
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
    });
    expect(actualEntity.title).toBe('Harbor Picks');
    expect(actualEntity.items).toHaveLength(1);
    expect(actualEntity.items?.[0]?.bookId).toBe(8);
  });
});
