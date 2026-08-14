import { BookPublishingStatus } from './enum/general.enum';

import { BOOK_PUBLISHING_TRANSITIONS } from './book-publishing-transitions';

describe('BOOK_PUBLISHING_TRANSITIONS', () => {
  it('allows pending books to enter review', () => {
    expect(BOOK_PUBLISHING_TRANSITIONS[BookPublishingStatus.PENDING]).toEqual([
      BookPublishingStatus.IN_REVIEW,
    ]);
  });

  it('allows in-review books to be approved or rejected', () => {
    expect(BOOK_PUBLISHING_TRANSITIONS[BookPublishingStatus.IN_REVIEW]).toEqual([
      BookPublishingStatus.APPROVED,
      BookPublishingStatus.REJECTED,
    ]);
  });

  it('allows rejected books to be resubmitted', () => {
    expect(BOOK_PUBLISHING_TRANSITIONS[BookPublishingStatus.REJECTED]).toEqual([
      BookPublishingStatus.IN_REVIEW,
    ]);
  });
});
