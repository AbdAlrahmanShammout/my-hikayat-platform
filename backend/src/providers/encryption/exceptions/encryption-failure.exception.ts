import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';

export class EncryptionFailureException extends DependencyFailureException {
  constructor() {
    super({
      message: 'Payload encryption or decryption failed',
      code: 'ENCRYPTION_FAILURE',
    });
  }
}
