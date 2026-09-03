import {
  flattenCatalogBookPages,
  formatCatalogResultCountLabel,
  resolveNextCatalogPageOffset,
} from './catalog-pagination';

describe('catalog pagination helpers', () => {
  it('resolves the next offset while more results remain', () => {
    expect(
      resolveNextCatalogPageOffset({
        lastPageOffset: 0,
        lastPageBookCount: 20,
        total: 45,
      }),
    ).toBe(20);
    expect(
      resolveNextCatalogPageOffset({
        lastPageOffset: 20,
        lastPageBookCount: 20,
        total: 45,
      }),
    ).toBe(40);
  });

  it('stops when the page is empty or the total is reached', () => {
    expect(
      resolveNextCatalogPageOffset({
        lastPageOffset: 40,
        lastPageBookCount: 5,
        total: 45,
      }),
    ).toBeUndefined();
    expect(
      resolveNextCatalogPageOffset({
        lastPageOffset: 0,
        lastPageBookCount: 0,
        total: 10,
      }),
    ).toBeUndefined();
  });

  it('flattens pages and skips duplicate book ids', () => {
    const actual = flattenCatalogBookPages([
      { books: [{ id: 1 }, { id: 2 }] },
      { books: [{ id: 2 }, { id: 3 }] },
    ]);
    expect(actual.map((book) => book.id)).toEqual([1, 2, 3]);
  });

  it('formats partial vs complete result counts', () => {
    expect(
      formatCatalogResultCountLabel({
        loadedCount: 20,
        total: 47,
        hasNextPage: true,
      }),
    ).toBe('Showing 20 of 47 books');
    expect(
      formatCatalogResultCountLabel({
        loadedCount: 47,
        total: 47,
        hasNextPage: false,
      }),
    ).toBe('47 books');
  });
});
