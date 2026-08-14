import { Prisma } from '@prisma/client';

import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { BookDetailsType } from '@/modules/book/types/book-details-schema.type';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookMapper } from './book.mapper';

describe('BookMapper', () => {
  it('maps a persistence payload including owner and categories', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const inputSchema: BookDetailsType = {
      id: 8,
      createdAt,
      updatedAt,
      deletedAt: null,
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: 'reflowable',
      bookType: 'standard_chapter',
      publishingStatus: 'pending',
      processingStatus: 'not_started',
      publishedAt: null,
      ownerId: 4,
      owner: {
        id: 4,
        createdAt,
        updatedAt,
        deletedAt: null,
        email: 'author@example.com',
        passwordHash: 'hashed-password',
        role: 'author',
        isPublisher: true,
      },
      categories: [
        {
          id: 2,
          createdAt,
          updatedAt,
          deletedAt: null,
          name: 'Picture Books',
          slug: 'picture-books',
          categoryWeight: new Prisma.Decimal('1.2500'),
        },
      ],
    };
    const actualEntity = BookMapper.toEntity(inputSchema);
    expect(actualEntity.title).toBe('The Last Lighthouse');
    expect(actualEntity.layoutType).toBe(BookLayoutType.REFLOWABLE);
    expect(actualEntity.bookType).toBe(BookType.STANDARD_CHAPTER);
    expect(actualEntity.publishingStatus).toBe(BookPublishingStatus.PENDING);
    expect(actualEntity.processingStatus).toBe(BookProcessingStatus.NOT_STARTED);
    expect(actualEntity.ownerId).toBe(4);
    expect(actualEntity.owner?.email).toBe('author@example.com');
    expect(actualEntity.owner?.role).toBe(UserRole.AUTHOR);
    expect(actualEntity.owner?.isPublisher).toBe(true);
    expect(actualEntity.categories).toHaveLength(1);
    expect(actualEntity.categories?.[0].slug).toBe('picture-books');
    expect(actualEntity.categories?.[0].categoryWeight).toBe(1.25);
  });
});
