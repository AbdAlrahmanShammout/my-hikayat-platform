import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { CategoryEntity } from '@/modules/category/entity/category.entity';

import { BookResponse } from './book.response';

describe('BookResponse', () => {
  it('projects catalog fields and nested categories', () => {
    const inputEntity = new BookEntity({
      id: 8,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.PENDING,
      publishedAt: null,
      categories: [
        new CategoryEntity({
          id: 2,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          name: 'Picture Books',
          slug: 'picture-books',
          categoryWeight: 1.25,
        }),
      ],
    });
    const actualResponse = new BookResponse(inputEntity);
    expect(actualResponse.title).toBe('The Last Lighthouse');
    expect(actualResponse.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualResponse.bookType).toBe(BookType.STANDARD_CHAPTER);
    expect(actualResponse.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(actualResponse.categories).toHaveLength(1);
    expect(actualResponse.categories[0].slug).toBe('picture-books');
  });
});
