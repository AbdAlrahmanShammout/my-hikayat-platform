import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';
import { CollectionDiscoveryResponse } from '@/modules/collection/dto/response/model/collection-discovery.response';

import { GetDiscoveryCollectionsResponseDto } from './get-discovery-collections-response.dto';

describe('GetDiscoveryCollectionsResponseDto', () => {
  it('maps discovery responses into the collection envelope', () => {
    const inputCollection = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
      items: [],
    });
    const discoveryResponse = new CollectionDiscoveryResponse(
      { collection: inputCollection, books: [] },
      [] as BookResponse[],
    );
    const actualResponse = new GetDiscoveryCollectionsResponseDto([discoveryResponse], 4);
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.collections).toHaveLength(1);
    expect(actualResponse.collections[0].id).toBe(3);
    expect(actualResponse.collections[0].title).toBe('Harbor Picks');
    expect(actualResponse.collections[0].books).toEqual([]);
  });
});
