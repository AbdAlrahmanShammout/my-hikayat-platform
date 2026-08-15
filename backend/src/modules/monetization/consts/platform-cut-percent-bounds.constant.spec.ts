import { PLATFORM_CUT_PERCENT_BOUNDS } from './platform-cut-percent-bounds.constant';

describe('PLATFORM_CUT_PERCENT_BOUNDS', () => {
  it('accepts a percent from zero through one hundred', () => {
    expect(PLATFORM_CUT_PERCENT_BOUNDS.min).toBe(0);
    expect(PLATFORM_CUT_PERCENT_BOUNDS.max).toBe(100);
    expect(PLATFORM_CUT_PERCENT_BOUNDS.decimalPlaces).toBe(2);
  });
});
