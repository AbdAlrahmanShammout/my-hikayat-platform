import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class BookAssetInvalidPreviewTypeException extends InvalidStateException {
  constructor() {
    super({
      message: 'Preview image must be a JPEG, PNG, or WebP file',
      code: 'BOOK_ASSET_INVALID_PREVIEW_TYPE',
    });
  }
}
