import { ApiError } from '@/api/api-error';
import { refreshOfflineBookAuthorization } from '@/features/offline/lib/refresh-offline-book-authorization';
import { tryLoadOfflinePlaintext } from '@/features/offline/lib/load-offline-plaintext';
import { downloadAndDecryptBookSource } from '@/features/reader/lib/download-and-decrypt-book-source';
import { loadBookPlaintext } from '@/features/reader/lib/load-book-plaintext';

jest.mock('@/features/offline/lib/load-offline-plaintext', () => ({
  tryLoadOfflinePlaintext: jest.fn(),
}));

jest.mock('@/features/offline/lib/refresh-offline-book-authorization', () => ({
  refreshOfflineBookAuthorization: jest.fn(),
}));

jest.mock('@/features/reader/lib/download-and-decrypt-book-source', () => ({
  downloadAndDecryptBookSource: jest.fn(),
}));

const mockTryLoadOfflinePlaintext = tryLoadOfflinePlaintext as jest.MockedFunction<
  typeof tryLoadOfflinePlaintext
>;
const mockRefreshOfflineBookAuthorization =
  refreshOfflineBookAuthorization as jest.MockedFunction<typeof refreshOfflineBookAuthorization>;
const mockDownloadAndDecryptBookSource = downloadAndDecryptBookSource as jest.MockedFunction<
  typeof downloadAndDecryptBookSource
>;

describe('loadBookPlaintext', () => {
  beforeEach(() => {
    mockTryLoadOfflinePlaintext.mockReset();
    mockRefreshOfflineBookAuthorization.mockReset();
    mockDownloadAndDecryptBookSource.mockReset();
  });

  it('refreshes an expired offline lease online and opens the existing package', async () => {
    const refreshedPlaintext = new Uint8Array([1, 2, 3]);
    mockTryLoadOfflinePlaintext
      .mockRejectedValueOnce(
        new ApiError({
          message: 'locked',
          code: 'OFFLINE_LEASE_EXPIRED',
          statusCode: 403,
        }),
      )
      .mockResolvedValueOnce(refreshedPlaintext);
    mockRefreshOfflineBookAuthorization.mockResolvedValue(true);
    const actual = await loadBookPlaintext({
      bookId: 8,
      sessionId: 12,
      deliveryGrant: {
        bookId: 8,
        bookAssetId: 9,
        kind: 'source',
        url: 'https://example.test/book.enc',
        expiresAt: '2026-08-29T12:05:00.000Z',
        contentType: 'application/epub+zip',
        byteSize: 1024,
        checksumSha256: null,
        isEncrypted: true,
      },
    });
    expect(actual).toBe(refreshedPlaintext);
    expect(mockRefreshOfflineBookAuthorization).toHaveBeenCalledWith({
      bookId: 8,
      sessionId: 12,
    });
    expect(mockDownloadAndDecryptBookSource).not.toHaveBeenCalled();
  });

  it('fails closed for an expired offline lease when offline', async () => {
    const expectedError = new ApiError({
      message: 'locked',
      code: 'OFFLINE_LEASE_EXPIRED',
      statusCode: 403,
    });
    mockTryLoadOfflinePlaintext.mockRejectedValue(expectedError);
    await expect(
      loadBookPlaintext({
        bookId: 8,
        sessionId: 0,
        deliveryGrant: null,
      }),
    ).rejects.toBe(expectedError);
  });
});
