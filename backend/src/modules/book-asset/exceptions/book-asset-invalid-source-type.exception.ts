import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetInvalidSourceTypeException extends InvalidStateException {
  constructor() {
    super({
      message: 'Source file must be an EPUB or PDF',
      code: 'BOOK_ASSET_INVALID_SOURCE_TYPE',
    });
  }
}
