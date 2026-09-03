import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';

import { GetSearchBooksResponseDto } from './get-search-books-response.dto';

describe('GetSearchBooksResponseDto', () => {
  it('maps book responses into the search collection envelope', () => {
    const inputEntity = new BookEntity({
      id: 8,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: null,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.APPROVED,
      processingStatus: BookProcessingStatus.READY,
      publishedAt: new Date('2026-08-15T00:00:00.000Z'),
      ownerId: 4,
      categories: [],
    });
    const actualResponse = new GetSearchBooksResponseDto([new BookResponse(inputEntity)], 3);
    expect(actualResponse.total).toBe(3);
    expect(actualResponse.books).toHaveLength(1);
    expect(actualResponse.books[0].id).toBe(8);
    expect(actualResponse.books[0].title).toBe('The Last Lighthouse');
    expect(actualResponse.books[0].cover).toBeNull();
  });
});
