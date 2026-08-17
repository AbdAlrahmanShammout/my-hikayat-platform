import { describe, expect, it } from 'vitest';

import { isSameCategoryWeight } from '@/features/categories/lib/is-same-category-weight';

describe('isSameCategoryWeight', () => {
  it('is true when the values match', () => {
    const actualResult = isSameCategoryWeight(1.25, 1.25);
    expect(actualResult).toBe(true);
  });

  it('is false when the values differ', () => {
    const actualResult = isSameCategoryWeight(1.25, 2);
    expect(actualResult).toBe(false);
  });
});
