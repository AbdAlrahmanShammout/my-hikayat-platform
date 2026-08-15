import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { PlanSlugConflictException } from './plan-slug-conflict.exception';

describe('PlanSlugConflictException', () => {
  it('reports a slug conflict', () => {
    const actualException = new PlanSlugConflictException('free');
    expect(actualException.kind).toBe(ErrorKind.CONFLICT);
    expect(actualException.code).toBe('PLAN_SLUG_CONFLICT');
  });
});
