import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { PlanKind } from '@/modules/subscription/enum/general.enum';

import { PlanKindConflictException } from './plan-kind-conflict.exception';

describe('PlanKindConflictException', () => {
  it('reports a kind conflict', () => {
    const actualException = new PlanKindConflictException(PlanKind.FREE);
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('PLAN_KIND_CONFLICT');
  });
});
