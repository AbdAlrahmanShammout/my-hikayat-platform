import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetInvalidPromoVideoTypeException extends InvalidStateException {
  constructor() {
    super({
      message: 'Promo video must be an MP4 or WebM file',
      code: 'BOOK_ASSET_INVALID_PROMO_VIDEO_TYPE',
    });
  }
}
