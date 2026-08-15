import { allocateCentsByWeights } from './allocate-cents.helper';

describe('allocateCentsByWeights', () => {
  it('assigns leftover cents by largest remainder while preserving the total', () => {
    const actualCents = allocateCentsByWeights({
      weights: [1, 1, 1],
      totalCents: 100,
    });
    expect(actualCents).toEqual([34, 33, 33]);
    expect(actualCents.reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('returns zeros when the weight sum is zero', () => {
    const actualCents = allocateCentsByWeights({
      weights: [0, 0],
      totalCents: 500,
    });
    expect(actualCents).toEqual([0, 0]);
  });

  it('splits 7000 author cents and 3000 platform cents for 2.5 and 4.5 weights', () => {
    expect(allocateCentsByWeights({ weights: [2.5, 4.5], totalCents: 7000 })).toEqual([2500, 4500]);
    expect(allocateCentsByWeights({ weights: [2.5, 4.5], totalCents: 3000 })).toEqual([1071, 1929]);
  });
});
