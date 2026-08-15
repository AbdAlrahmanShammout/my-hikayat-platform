import { computePlatformCutCents } from './platform-cut-cents.helper';

describe('computePlatformCutCents', () => {
  it('rounds the configured percent of the pool to cents', () => {
    const actualCents = computePlatformCutCents({
      poolAmountCents: 10000,
      platformCutPercent: 25,
    });
    expect(actualCents).toBe(2500);
  });
});
