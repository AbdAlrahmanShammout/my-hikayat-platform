import { createBookAssetDeliveryGrant } from './create-delivery-grant';
import { requestJson } from '@/api/client';

jest.mock('@/api/client', () => ({
  requestJson: jest.fn(),
}));

const mockRequestJson = requestJson as jest.MockedFunction<typeof requestJson>;

describe('createBookAssetDeliveryGrant', () => {
  beforeEach(() => {
    mockRequestJson.mockReset();
  });

  it('posts the delivery-grant path', async () => {
    mockRequestJson.mockResolvedValue({
      bookId: 8,
      bookAssetId: 9,
      kind: 'source',
      url: 'https://example.test/file',
      expiresAt: '2026-08-15T16:05:00.000Z',
      contentType: 'application/epub+zip',
      byteSize: 10,
      checksumSha256: null,
      isEncrypted: true,
    });
    await createBookAssetDeliveryGrant(8);
    expect(mockRequestJson).toHaveBeenCalledWith({
      path: '/reader/books/8/delivery-grant',
      method: 'POST',
    });
  });
});
