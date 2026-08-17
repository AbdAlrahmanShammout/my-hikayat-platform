import { describe, expect, it } from 'vitest';

import { moveCollectionBook } from '@/features/collections/lib/move-collection-book';

describe('moveCollectionBook', () => {
  it('moves an item up', () => {
    const actualBookIds: number[] = moveCollectionBook({
      bookIds: [8, 9, 10],
      index: 2,
      direction: -1,
    });
    expect(actualBookIds).toEqual([8, 10, 9]);
  });

  it('leaves the list unchanged when the move is out of range', () => {
    const inputBookIds: number[] = [8, 9];
    const actualBookIds: number[] = moveCollectionBook({
      bookIds: inputBookIds,
      index: 0,
      direction: -1,
    });
    expect(actualBookIds).toEqual([8, 9]);
  });
});
