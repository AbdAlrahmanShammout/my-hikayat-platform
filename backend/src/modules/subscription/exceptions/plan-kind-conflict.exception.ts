import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';
import { PlanKind } from '@/modules/subscription/enum/general.enum';

export class PlanKindConflictException extends ResourceConflictException {
  constructor(kind: PlanKind) {
    super({
      message: `A plan with kind ${kind} already exists`,
      code: 'PLAN_KIND_CONFLICT',
    });
  }
}
