import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetEncryptedSourceMissingException extends InvalidStateException {
  constructor(bookId: number) {
    super({
      message: `Encrypted source file is missing for book ${bookId}`,
      code: 'BOOK_ASSET_ENCRYPTED_SOURCE_MISSING',
    });
  }
}
