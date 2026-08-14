import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class CategoryNameConflictException extends ResourceConflictException {
  constructor(name: string) {
    super({
      message: `A category with name ${name} already exists`,
      code: 'CATEGORY_NAME_CONFLICT',
    });
  }
}
