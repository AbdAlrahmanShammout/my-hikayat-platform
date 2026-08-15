import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

import { CreateBookAssetDeliveryGrantResponseDto } from './create-book-asset-delivery-grant-response.dto';

describe('CreateBookAssetDeliveryGrantResponseDto', () => {
  it('maps the grant without a storage key', () => {
    const expiresAt = new Date('2026-08-15T16:05:00.000Z');
    const actualResponse = new CreateBookAssetDeliveryGrantResponseDto({
      bookId: 8,
      bookAssetId: 9,
      kind: BookAssetKind.SOURCE,
      url: 'memory://books%2F8%2Fsource%2Fuuid',
      expiresAt,
      contentType: 'application/epub+zip',
      byteSize: 16,
      checksumSha256: 'a'.repeat(64),
      isEncrypted: true,
    });
    expect(actualResponse.bookId).toBe(8);
    expect(actualResponse.bookAssetId).toBe(9);
    expect(actualResponse.isEncrypted).toBe(true);
    expect(actualResponse).not.toHaveProperty('storageKey');
  });
});
