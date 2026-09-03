import { resolveCatalogBookAttribution } from '@/features/catalog/lib/resolve-catalog-book-attribution';

describe('resolveCatalogBookAttribution', () => {
  it('builds author and publisher lines when both are present', () => {
    const actual = resolveCatalogBookAttribution({
      authorName: 'Sara Nour',
      publisherName: 'Hikayat Press',
    });
    expect(actual).toEqual({
      authorLine: 'By Sara Nour',
      publisherLine: 'Publisher Hikayat Press',
    });
  });

  it('returns null lines when names are missing or blank', () => {
    const actual = resolveCatalogBookAttribution({
      authorName: '   ',
      publisherName: null,
    });
    expect(actual).toEqual({
      authorLine: null,
      publisherLine: null,
    });
  });
});
