import { BookProcessingStatus } from '@/modules/book/enum/general.enum';

export const BOOK_PROCESSING_TRANSITIONS: Record<
  BookProcessingStatus,
  readonly BookProcessingStatus[]
> = {
  [BookProcessingStatus.NOT_STARTED]: [BookProcessingStatus.PROCESSING],
  [BookProcessingStatus.PROCESSING]: [BookProcessingStatus.READY, BookProcessingStatus.FAILED],
  [BookProcessingStatus.READY]: [BookProcessingStatus.PROCESSING, BookProcessingStatus.NOT_STARTED],
  [BookProcessingStatus.FAILED]: [
    BookProcessingStatus.PROCESSING,
    BookProcessingStatus.NOT_STARTED,
  ],
};
