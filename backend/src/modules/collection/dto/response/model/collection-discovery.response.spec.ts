import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CollectionEntity } from '@/modules/collection/entity/collection.entity';

import { CollectionDiscoveryResponse } from './collection-discovery.response';

describe('CollectionDiscoveryResponse', () => {
  it('projects the collection title and published books in editorial order', () => {
    const inputCollection = new CollectionEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'Harbor Picks',
      items: [],
    });
    const inputBook = new BookEntity({
      id: 8,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.APPROVED,
      processingStatus: BookProcessingStatus.READY,
      publishedAt: new Date('2026-08-15T00:00:00.000Z'),
      ownerId: 4,
      categories: [],
    });
    const actualResponse = new CollectionDiscoveryResponse(
      {
        collection: inputCollection,
        books: [inputBook],
      },
      [new BookResponse(inputBook)],
    );
    expect(actualResponse.id).toBe(3);
    expect(actualResponse.title).toBe('Harbor Picks');
    expect(actualResponse.books).toHaveLength(1);
    expect(actualResponse.books[0].id).toBe(8);
    expect(actualResponse.books[0].title).toBe('The Last Lighthouse');
    expect(actualResponse.books[0].cover).toBeNull();
  });
});
