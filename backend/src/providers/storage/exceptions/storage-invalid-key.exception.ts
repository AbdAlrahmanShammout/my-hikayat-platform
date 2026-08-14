import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class StorageInvalidKeyException extends InvalidStateException {
  constructor(key: string) {
    super({
      message: `Storage object key is invalid: ${key}`,
      code: 'STORAGE_INVALID_KEY',
    });
  }
}
