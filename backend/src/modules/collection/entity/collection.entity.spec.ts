import { CollectionBookEntity } from './collection-book.entity';
import { CollectionEntity } from './collection.entity';

describe('CollectionEntity', () => {
  it('holds a title and ordered collection books', () => {
    const actualEntity = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
      items: [
        new CollectionBookEntity({
          id: 9,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          collectionId: 3,
          bookId: 8,
          displayOrder: 0,
        }),
      ],
    });
    expect(actualEntity.title).toBe('Harbor Picks');
    expect(actualEntity.items?.[0]?.bookId).toBe(8);
  });
});
