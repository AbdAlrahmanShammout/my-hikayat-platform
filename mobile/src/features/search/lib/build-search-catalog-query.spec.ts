import { buildSearchCatalogQuery } from './build-search-catalog-query';

describe('buildSearchCatalogQuery', () => {
  it('returns null for blank query text', () => {
    expect(buildSearchCatalogQuery({ field: 'title', query: '   ' })).toBeNull();
  });

  it('maps a title search with normalized whitespace', () => {
    expect(
      buildSearchCatalogQuery({
        field: 'title',
        query: '  Harbor   Lights  ',
        limit: 20,
        offset: 0,
      }),
    ).toEqual({
      limit: 20,
      offset: 0,
      title: 'Harbor Lights',
    });
  });

  it('maps author and publisher onto a single backend field', () => {
    expect(buildSearchCatalogQuery({ field: 'author', query: 'Jane' })).toEqual({
      author: 'Jane',
    });
    expect(buildSearchCatalogQuery({ field: 'publisher', query: 'Harbor Press' })).toEqual({
      publisher: 'Harbor Press',
    });
  });
});
