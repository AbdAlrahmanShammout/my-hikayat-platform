import { BookPublishingStatus } from '@/modules/book/enum/general.enum';

export const BOOK_PUBLISHING_TRANSITIONS: Record<
  BookPublishingStatus,
  readonly BookPublishingStatus[]
> = {
  [BookPublishingStatus.PENDING]: [BookPublishingStatus.IN_REVIEW],
  [BookPublishingStatus.IN_REVIEW]: [BookPublishingStatus.APPROVED, BookPublishingStatus.REJECTED],
  [BookPublishingStatus.APPROVED]: [],
  [BookPublishingStatus.REJECTED]: [BookPublishingStatus.IN_REVIEW],
};
