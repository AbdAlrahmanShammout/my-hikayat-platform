import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { GetDiscoveryCollectionsResponseDto } from './get-discovery-collections-response.dto';

describe('GetDiscoveryCollectionsResponseDto', () => {
  it('maps a discovery page into the collection envelope', () => {
    const inputCollection = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
      items: [],
    });
    const actualResponse = new GetDiscoveryCollectionsResponseDto({
      entities: [{ collection: inputCollection, books: [] }],
      total: 4,
    });
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.collections).toHaveLength(1);
    expect(actualResponse.collections[0].id).toBe(3);
    expect(actualResponse.collections[0].title).toBe('Harbor Picks');
    expect(actualResponse.collections[0].books).toEqual([]);
  });
});
