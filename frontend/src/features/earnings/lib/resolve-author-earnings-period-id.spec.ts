import { describe, expect, it } from 'vitest';

import { resolveAuthorEarningsPeriodId } from '@/features/earnings/lib/resolve-author-earnings-period-id';

describe('resolveAuthorEarningsPeriodId', () => {
  it('keeps the URL revenuePeriodId even when it is not on the current trend page', () => {
    const actualPeriodId = resolveAuthorEarningsPeriodId({
      revenuePeriodId: 9,
      points: [{ revenuePeriodId: 4 }],
    });
    expect(actualPeriodId).toBe(9);
  });

  it('uses the first trend point when the URL has no period', () => {
    const actualPeriodId = resolveAuthorEarningsPeriodId({
      revenuePeriodId: undefined,
      points: [{ revenuePeriodId: 4 }, { revenuePeriodId: 2 }],
    });
    expect(actualPeriodId).toBe(4);
  });
});
