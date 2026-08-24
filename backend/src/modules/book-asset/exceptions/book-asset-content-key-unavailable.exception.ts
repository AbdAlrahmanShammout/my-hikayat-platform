import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetContentKeyUnavailableException extends InvalidStateException {
  constructor(bookAssetId: number) {
    super({
      message: `Book asset ${bookAssetId} has no content key available for delivery`,
      code: 'BOOK_CONTENT_KEY_UNAVAILABLE',
    });
  }
}
