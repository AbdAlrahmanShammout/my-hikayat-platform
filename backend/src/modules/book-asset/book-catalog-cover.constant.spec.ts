import { BOOK_CATALOG_COVER } from './book-catalog-cover.constant';

describe('BOOK_CATALOG_COVER', () => {
  it('issues catalog cover URLs for one hour', () => {
    expect(BOOK_CATALOG_COVER.expiresInSeconds).toBe(3_600);
  });
});
