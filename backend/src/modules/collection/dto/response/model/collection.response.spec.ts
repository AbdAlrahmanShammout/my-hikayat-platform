import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { CollectionResponse } from './collection.response';

describe('CollectionResponse', () => {
  it('projects the title and ordered collection books', () => {
    const inputEntity = new CollectionEntity({
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
    const actualResponse = new CollectionResponse(inputEntity);
    expect(actualResponse.title).toBe('Harbor Picks');
    expect(actualResponse.items).toHaveLength(1);
    expect(actualResponse.items[0].bookId).toBe(8);
    expect(actualResponse.items[0].displayOrder).toBe(0);
  });

  it('projects an empty item list when membership is omitted', () => {
    const inputEntity = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
    });
    const actualResponse = new CollectionResponse(inputEntity);
    expect(actualResponse.items).toEqual([]);
  });
});
