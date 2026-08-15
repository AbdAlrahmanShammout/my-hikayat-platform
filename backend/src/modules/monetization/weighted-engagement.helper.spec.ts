import { computeWeightedEngagementMinutes } from './weighted-engagement.helper';

describe('computeWeightedEngagementMinutes', () => {
  it('multiplies active minutes by category weight', () => {
    const actualWeighted = computeWeightedEngagementMinutes({
      engagementMs: 120000,
      categoryWeight: 1.25,
    });
    expect(actualWeighted).toBe(2.5);
  });
});
