import { describe, expect, it } from 'vitest';

import { resolveAuthorAnalyticsPeriodId } from '@/features/analytics/lib/resolve-author-analytics-period-id';

describe('resolveAuthorAnalyticsPeriodId', () => {
  it('keeps the URL revenuePeriodId even when it is not in the lookup page', () => {
    const actualPeriodId = resolveAuthorAnalyticsPeriodId({
      revenuePeriodId: 9,
      points: [{ revenuePeriodId: 4 }],
    });
    expect(actualPeriodId).toBe(9);
  });

  it('uses the first trend point when the URL has no period', () => {
    const actualPeriodId = resolveAuthorAnalyticsPeriodId({
      revenuePeriodId: undefined,
      points: [{ revenuePeriodId: 4 }, { revenuePeriodId: 2 }],
    });
    expect(actualPeriodId).toBe(4);
  });
});
