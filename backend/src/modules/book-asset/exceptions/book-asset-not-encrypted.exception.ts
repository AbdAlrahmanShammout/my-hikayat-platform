import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetNotEncryptedException extends InvalidStateException {
  constructor(bookAssetId: number) {
    super({
      message: `Book asset ${bookAssetId} must remain encrypted for download`,
      code: 'BOOK_ASSET_NOT_ENCRYPTED',
    });
  }
}
