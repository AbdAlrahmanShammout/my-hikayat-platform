import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';

export class PlanSlugConflictException extends ResourceConflictException {
  constructor(slug: string) {
    super({
      message: `A plan with slug ${slug} already exists`,
      code: 'PLAN_SLUG_CONFLICT',
    });
  }
}
