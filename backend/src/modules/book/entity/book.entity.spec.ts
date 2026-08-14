import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';

import { BookEntity } from './book.entity';

describe('BookEntity', () => {
  it('holds catalog metadata, layout, type, and publishing status', () => {
    const actualEntity = new BookEntity({
      id: 8,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.PENDING,
      publishedAt: null,
      ownerId: 4,
    });
    expect(actualEntity.id).toBe(8);
    expect(actualEntity.title).toBe('The Last Lighthouse');
    expect(actualEntity.ownerId).toBe(4);
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.bookType).toBe(BookType.STANDARD_CHAPTER);
    expect(actualEntity.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(actualEntity.publishedAt).toBeNull();
  });
});
