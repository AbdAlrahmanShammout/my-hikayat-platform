import { CatalogSort } from './catalog-sort.enum';

describe('CatalogSort', () => {
  it('names the fixed catalog orderings', () => {
    expect(CatalogSort.NEWEST).toBe('newest');
    expect(CatalogSort.POPULARITY).toBe('popularity');
  });
});
