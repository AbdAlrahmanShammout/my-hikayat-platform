import { AppException } from '@/common/exceptions/app.exception';
import { ErrorKind } from '@/common/exceptions/error-kind.enum';

export class StorageObjectNotFoundException extends AppException {
  constructor(key: string) {
    super({
      message: `Storage object ${key} was not found`,
      code: 'STORAGE_OBJECT_NOT_FOUND',
      kind: ErrorKind.NOT_FOUND,
      userFriendly: true,
    });
  }
}
