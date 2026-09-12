import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class CollectionInvalidAccentColorException extends InvalidStateException {
  constructor() {
    super({
      message: 'Collection accent color must be a six-digit hex value such as #1A6B4A',
      code: 'COLLECTION_INVALID_ACCENT_COLOR',
    });
  }
}
