import { BOOK_DELIVERY_GRANT } from './book-delivery-grant.constant';

describe('BOOK_DELIVERY_GRANT', () => {
  it('uses a five-minute signed URL lifetime', () => {
    expect(BOOK_DELIVERY_GRANT.expiresInSeconds).toBe(300);
  });
});
