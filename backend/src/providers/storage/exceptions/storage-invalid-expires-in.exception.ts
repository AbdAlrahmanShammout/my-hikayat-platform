import { InvalidStateException } from '@/common/exceptions/invalid-state.exception';

export class StorageInvalidExpiresInException extends InvalidStateException {
  constructor() {
    super({
      message: 'Signed URL expiry must be a positive integer number of seconds',
      code: 'STORAGE_INVALID_EXPIRES_IN',
    });
  }
}
