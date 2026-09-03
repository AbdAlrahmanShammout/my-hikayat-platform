import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';

describe('resolveCatalogCoverPresentation', () => {
  it('returns placeholder when cover is missing', () => {
    expect(resolveCatalogCoverPresentation(null)).toEqual({ kind: 'placeholder' });
    expect(resolveCatalogCoverPresentation(undefined)).toEqual({ kind: 'placeholder' });
  });

  it('returns placeholder when cover url is blank', () => {
    expect(resolveCatalogCoverPresentation({ url: '   ' })).toEqual({ kind: 'placeholder' });
  });

  it('returns image when cover url is present', () => {
    expect(
      resolveCatalogCoverPresentation({ url: 'https://cdn.example.com/cover.jpg' }),
    ).toEqual({
      kind: 'image',
      url: 'https://cdn.example.com/cover.jpg',
    });
  });
});
