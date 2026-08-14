import { BookLayoutType, BookPublishingStatus, BookType } from './general.enum';

describe('Book domain enums', () => {
  it('mirrors the database layout type literals', () => {
    expect(BookLayoutType.REFLOWABLE).toBe('reflowable');
    expect(BookLayoutType.FIXED_LAYOUT).toBe('fixed_layout');
  });

  it('mirrors the database book type literals', () => {
    expect(BookType.STANDARD_CHAPTER).toBe('standard_chapter');
    expect(BookType.PICTURE_BOOK).toBe('picture_book');
    expect(BookType.ILLUSTRATED_CHAPTER).toBe('illustrated_chapter');
  });

  it('mirrors the database publishing status literals', () => {
    expect(BookPublishingStatus.PENDING).toBe('pending');
    expect(BookPublishingStatus.IN_REVIEW).toBe('in_review');
    expect(BookPublishingStatus.APPROVED).toBe('approved');
    expect(BookPublishingStatus.REJECTED).toBe('rejected');
  });
});
