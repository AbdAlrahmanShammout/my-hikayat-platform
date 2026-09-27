import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class CollectionInvalidCoverTypeException extends InvalidStateException {
  constructor() {
    super({
      message: 'Collection cover must be a JPEG, PNG, or WebP file',
      code: 'COLLECTION_INVALID_COVER_TYPE',
    });
  }
}
