import { describe, expect, it } from 'vitest';

import { buildCreateAdminPlanBody } from '@/features/plans/lib/build-create-admin-plan-body';

describe('buildCreateAdminPlanBody', () => {
  it('maps paid create form values to monthly_paid kind', () => {
    const actual = buildCreateAdminPlanBody({
      name: ' Plus ',
      description: ' Full access ',
      stripePriceId: ' price_abc ',
    });
    expect(actual).toEqual({
      name: 'Plus',
      description: 'Full access',
      kind: 'monthly_paid',
      stripePriceId: 'price_abc',
    });
  });
});
