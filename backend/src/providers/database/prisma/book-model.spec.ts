import { BookLayoutType, BookPublishingStatus, BookType } from '@prisma/client';

describe('Book Prisma model', () => {
  it('defines layout types for reflowable and fixed-layout books', () => {
    expect(BookLayoutType.reflowable).toBe('reflowable');
    expect(BookLayoutType.fixed_layout).toBe('fixed_layout');
  });

  it('defines book types for chapter, picture, and illustrated books', () => {
    expect(BookType.standard_chapter).toBe('standard_chapter');
    expect(BookType.picture_book).toBe('picture_book');
    expect(BookType.illustrated_chapter).toBe('illustrated_chapter');
  });

  it('defines the publishing-status lifecycle', () => {
    expect(BookPublishingStatus.pending).toBe('pending');
    expect(BookPublishingStatus.in_review).toBe('in_review');
    expect(BookPublishingStatus.approved).toBe('approved');
    expect(BookPublishingStatus.rejected).toBe('rejected');
  });
});
