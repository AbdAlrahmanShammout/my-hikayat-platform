import { AppException } from './app.exception';
import { ErrorKind } from './error-kind.enum';

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier: string | number) {
    super({
      message: `${resource} with identifier ${identifier} was not found`,
      code: 'RESOURCE_NOT_FOUND',
      kind: ErrorKind.NOT_FOUND,
      userFriendly: true,
    });
  }
}
