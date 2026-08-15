import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';

import { CollectionBookResponse } from './collection-book.response';

describe('CollectionBookResponse', () => {
  it('projects the collection book locator and display order', () => {
    const inputEntity = new CollectionBookEntity({
      id: 9,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      collectionId: 3,
      bookId: 8,
      displayOrder: 0,
    });
    const actualResponse = new CollectionBookResponse(inputEntity);
    expect(actualResponse.id).toBe(9);
    expect(actualResponse.collectionId).toBe(3);
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.displayOrder).toBe(0);
  });
});
