import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class ReadingBookmarkBookLayoutUnknownException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Book ${bookId} has no detected layout type`,
      code: 'READING_BOOKMARK_BOOK_LAYOUT_UNKNOWN',
    });
  }
}
