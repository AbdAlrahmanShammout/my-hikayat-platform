import { DependencyFailureException } from '@/common/exceptions/dependency-failure.exception';

export class StorageFailureException extends DependencyFailureException {
  constructor() {
    super({
      message: 'Object storage request failed',
      code: 'STORAGE_FAILURE',
    });
  }
}
