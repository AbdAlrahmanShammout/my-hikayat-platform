import { describe, expect, it } from 'vitest';

import { mergeCategoryOptions } from '@/features/books/lib/merge-category-options';

describe('mergeCategoryOptions', () => {
  it('keeps lookup order and appends assigned categories missing from the lookup', () => {
    const actualResult = mergeCategoryOptions(
      [
        { id: 2, name: 'Fiction' },
        { id: 4, name: 'History' },
      ],
      [
        { id: 4, name: 'History' },
        { id: 7, name: 'Poetry' },
      ],
    );
    expect(actualResult).toEqual([
      { id: 2, name: 'Fiction' },
      { id: 4, name: 'History' },
      { id: 7, name: 'Poetry' },
    ]);
  });

  it('returns the lookup when every assigned category is already present', () => {
    const inputLookup = [{ id: 2, name: 'Fiction' }];
    const actualResult = mergeCategoryOptions(inputLookup, [{ id: 2, name: 'Fiction' }]);
    expect(actualResult).toEqual(inputLookup);
  });
});
