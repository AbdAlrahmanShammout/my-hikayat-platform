import { CollectionResponse } from '@/modules/collection/dto/response/model/collection.response';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { GetCollectionsResponseDto } from './get-collections-response.dto';

describe('GetCollectionsResponseDto', () => {
  it('maps a collection page into the collection envelope', () => {
    const inputEntity = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
      items: [],
    });
    const actualResponse = new GetCollectionsResponseDto(
      [new CollectionResponse(inputEntity, null)],
      4,
    );
    expect(actualResponse.total).toBe(4);
    expect(actualResponse.collections).toHaveLength(1);
    expect(actualResponse.collections[0].id).toBe(3);
    expect(actualResponse.collections[0].title).toBe('Harbor Picks');
  });
});
