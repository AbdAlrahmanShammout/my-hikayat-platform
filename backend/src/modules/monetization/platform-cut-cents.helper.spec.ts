import { computePlatformCutCents } from './platform-cut-cents.helper';

describe('computePlatformCutCents', () => {
  it('keeps 60 percent of the net pool', () => {
    expect(computePlatformCutCents(10000)).toBe(6000);
  });
});
