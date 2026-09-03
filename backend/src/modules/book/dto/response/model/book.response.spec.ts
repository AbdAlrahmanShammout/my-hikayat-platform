import { BookEntity } from '@/modules/book/entity/book.entity';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { BookResponse } from './book.response';

describe('BookResponse', () => {
  it('projects catalog fields, owner, and nested categories without the password hash', () => {
    const inputEntity = new BookEntity({
      id: 8,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      title: 'The Last Lighthouse',
      description: 'A reflowable chapter book.',
      layoutType: BookLayoutType.REFLOWABLE,
      bookType: BookType.STANDARD_CHAPTER,
      publishingStatus: BookPublishingStatus.PENDING,
      processingStatus: BookProcessingStatus.NOT_STARTED,
      publishedAt: null,
      ownerId: 4,
      owner: new UserEntity({
        id: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        email: 'author@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.AUTHOR,
        isPublisher: true,
      }),
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
    expect(actualResponse.processingStatus).toBe(BookProcessingStatus.NOT_STARTED);
    expect(actualResponse.ownerId).toBe(4);
    expect(actualResponse.owner?.email).toBe('author@example.com');
    expect(actualResponse.owner?.isPublisher).toBe(true);
    expect(actualResponse.owner).not.toHaveProperty('passwordHash');
    expect(actualResponse.categories).toHaveLength(1);
    expect(actualResponse.categories[0].slug).toBe('picture-books');
    expect(actualResponse.cover).toBeNull();
  });

  it('projects an optional catalog cover when provided', () => {
    const inputEntity = new BookEntity({
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
    const actualResponse = new BookResponse(inputEntity, {
      url: 'https://cdn.example.com/cover.jpg',
      expiresAt: new Date('2026-09-03T13:00:00.000Z'),
      contentType: 'image/jpeg',
    });
    expect(actualResponse.cover).toEqual({
      url: 'https://cdn.example.com/cover.jpg',
      expiresAt: new Date('2026-09-03T13:00:00.000Z'),
      contentType: 'image/jpeg',
    });
  });
});
