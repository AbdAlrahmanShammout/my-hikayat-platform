import { describe, expect, it } from 'vitest';

import { isSameBookOrder } from '@/features/collections/lib/is-same-book-order';

describe('isSameBookOrder', () => {
  it('returns true for the same sequence', () => {
    expect(isSameBookOrder([8, 9], [8, 9])).toBe(true);
  });

  it('returns false when order or membership differs', () => {
    expect(isSameBookOrder([8, 9], [9, 8])).toBe(false);
    expect(isSameBookOrder([8], [8, 9])).toBe(false);
  });
});
