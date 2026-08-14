import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class CategorySlugConflictException extends ResourceConflictException {
  constructor(slug: string) {
    super({
      message: `A category with slug ${slug} already exists`,
      code: 'CATEGORY_SLUG_CONFLICT',
    });
  }
}
